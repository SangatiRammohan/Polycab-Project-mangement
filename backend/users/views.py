from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework import status, viewsets, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .serializers import UserSerializer, UserListSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing user instances.
    """
    queryset = User.objects.all()
    filterset_fields = ['username', 'email', 'full_name', 'role', 'is_active']
    search_fields = ['username', 'email', 'full_name', 'phone']
    ordering_fields = ['username', 'email', 'full_name', 'role', 'date_joined', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    def get_permissions(self):
        print(f"🔥 UserViewSet: {self.action} endpoint called")
        if self.action == 'list':
            return [AllowAny()]  # ✅ Anyone can access user list
        elif self.action == 'bulk_create':  # ✅ Allow unauthenticated users to bulk create
            return [AllowAny()]
        elif self.action == "bulk_update":
            return [AllowAny()] 
        elif self.action == 'create':
            return [IsAuthenticated()]
        elif self.action =='destroy':
            return [AllowAny()]
        else:
            return [IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='bulk-create', permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_create(self, request):
        print("🔥 bulk_create endpoint called")
        # if not request.user.is_authenticated:
        #     return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)




    @action(detail=False, methods=['patch'], url_path='bulk-update', permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_update(self, request):
        print("🔥 bulk_update endpoint called")
        print(f"Request data: {request.data}")

        if not isinstance(request.data, list) or not all(isinstance(item, dict) for item in request.data):
            return Response({"detail": "Expected a list of user update dictionaries."}, status=status.HTTP_400_BAD_REQUEST)

        updated_users = []
        errors = []

        for item in request.data:
            user_id = item.get("id")
            if not user_id:
                errors.append({"detail": "Each item must include an 'id'"})
                continue

            try:
                instance = User.objects.get(id=user_id)
            except User.DoesNotExist:
                errors.append({"id": user_id, "detail": "User not found"})
                continue

            serializer = UserSerializer(instance, data=item, partial=True)
            if serializer.is_valid():
                serializer.save()
                updated_users.append(serializer.data)
            else:
                errors.append({user_id: serializer.errors})

        if errors:
            return Response(
                {"updated": updated_users, "errors": errors},
                status=status.HTTP_207_MULTI_STATUS  # 207 means "Multi-Status"
            )

        return Response(updated_users, status=status.HTTP_200_OK)



    @action(detail=False, methods=['post'], url_path='bulk-delete', permission_classes=[IsAuthenticated, IsAdminUser])
    def bulk_delete(self, request):
        user_ids = request.data.get('ids', [])
        if self.request.user.id in user_ids:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_403_FORBIDDEN
            )

        deleted_count = User.objects.filter(id__in=user_ids).delete()[0]
        return Response({"deleted_count": deleted_count}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    """
    View to retrieve the current authenticated user's information.
    """
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    """
    View for user login.
    """
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'role': user.role if hasattr(user, 'role') and user.role else 'user',
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name if hasattr(user, 'full_name') else '',
                'id': user.id
            })

        return Response(
            {'detail': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class UserLogoutView(APIView):
    """
    View for user logout.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out."})

class UserBulkCreateView(generics.CreateAPIView):
    """
    View for creating multiple users at once.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def create(self, request, *args, **kwargs):
        # Check if the user is authenticated
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class UserBulkUpdateView(APIView):
    """
    View for updating multiple users at once.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request):
        user_data = request.data
        updated_users = []
        errors = []

        for data in user_data:
            try:
                user_id = data.pop('id', None)
                if not user_id:
                    errors.append({"error": "User ID is required for bulk update."})
                    continue

                user = User.objects.get(id=user_id)
                serializer = UserSerializer(user, data=data, partial=True)
                
                if serializer.is_valid():
                    serializer.save()
                    updated_users.append(serializer.data)
                else:
                    errors.append({"id": user_id, "errors": serializer.errors})
            except User.DoesNotExist:
                errors.append({"id": user_id, "error": "User does not exist."})
            except Exception as e:
                errors.append({"id": user_id, "error": str(e)})

        return Response({
            "updated": updated_users,
            "errors": errors
        })

class UserBulkDeleteView(APIView):
    """
    View for deleting multiple users at once.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        user_ids = request.data.get('ids', [])
        
        # Check if the user is trying to delete themselves
        if request.user.id in user_ids:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Try to delete the users
        try:
            deleted_count, _ = User.objects.filter(id__in=user_ids).delete()
            return Response({"deleted_count": deleted_count})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeView(APIView):
    """
    View for changing a user's password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Check if the old password is correct
        if not user.check_password(old_password):
            return Response(
                {"detail": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the new passwords match
        if new_password != confirm_password:
            return Response(
                {"detail": "New passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set the new password
        user.set_password(new_password)
        user.save()
        
        # Update the session auth hash to keep the user logged in
        from django.contrib.auth import update_session_auth_hash
        update_session_auth_hash(request, user)
        
        return Response({"detail": "Password updated successfully."})


class PasswordResetView(APIView):
    """
    View to request a password reset email.
    """
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist
            return Response({"detail": "Password reset email has been sent."})

        # Generate password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build reset URL - frontend would handle this route
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        # Send email
        subject = "Password Reset Request"
        message = f"""
        You're receiving this email because you requested a password reset for your account.
        
        Please go to the following page to set a new password:
        
        {reset_url}
        
        If you didn't request this, you can safely ignore this email.
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response(
                {"detail": f"Error sending email: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
        return Response({"detail": "Password reset email has been sent."})


class PasswordResetConfirmView(APIView):
    """
    View to confirm a password reset request.
    """
    permission_classes = []

    def post(self, request, uidb64, token):
        try:
            # Decode the UID from base64
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        # Check if the token is valid
        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            
            # Check if the new passwords match
            if new_password != confirm_password:
                return Response(
                    {"detail": "Passwords do not match."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Set the new password
            user.set_password(new_password)
            user.save()
            
            return Response({"detail": "Password has been reset successfully."})
        else:
            return Response(
                {"detail": "Password reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST
            )

