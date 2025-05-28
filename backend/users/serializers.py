from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User objects with full CRUD capabilities.
    Handles password hashing during creation and update.
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'full_name', 'phone', 'role',
            'password', 'confirm_password', 'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, data):
        """
        Validate the data before saving.
        Ensure passwords match and meet requirements.
        """
        # Check if this is a create operation (will have password)
        if self.instance is None and 'password' not in data:
            raise serializers.ValidationError({'password': 'Password is required when creating a user'})
            
        # If password is being set/changed
        if 'password' in data:
            # Password is required for new users
            if not data.get('password'):
                raise serializers.ValidationError({'password': 'Password cannot be empty'})
                
            # Check if passwords match
            if data.get('password') != data.get('confirm_password'):
                raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
                
            # Validate password strength
            try:
                validate_password(data.get('password'))
            except ValidationError as e:
                raise serializers.ValidationError({'password': list(e)})
                
            # Remove confirm_password from the data that will be saved
            if 'confirm_password' in data:
                data.pop('confirm_password')
                
        return data
    
    def create(self, validated_data):
        """
        Create and return a new user, setting the password correctly.
        """
        # Handle empty username
        if 'username' not in validated_data or not validated_data['username']:
            if 'email' in validated_data:
                validated_data['username'] = validated_data['email']
            else:
                raise serializers.ValidationError({'username': 'Username is required'})
        
        # Extract password from validated data
        password = validated_data.pop('password', None)
        
        # Create user instance
        user = User(**validated_data)
        
        # Set password using the secure method
        if password:
            user.set_password(password)
            
        user.save()
        return user
    
    def update(self, instance, validated_data):
        """
        Update and return an existing user, handling password correctly.
        """
        # Extract password from validated data
        password = validated_data.pop('password', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
            
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing users with only essential fields
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'is_active']