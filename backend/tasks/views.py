from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.utils import timezone
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.authentication import TokenAuthentication
# from authentication import CsrfExemptSessionAuthentication
from .models import Task, Milestone
from users.models import User
from .serializers import (
    TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer,
    UserSerializer, MilestoneSerializer
)

# Load location data (in a real application, this would be from a database)
# For demonstration, we're using a mock data structure similar to what's in locationData.js
import json
from pathlib import Path
import os

# This would normally load from a file or DB, mocked for simplicity
LOCATION_DATA = {
    "states": ['BIHAR'],
    "BIHAR": {
      "businessAreas": ['PATNA', 'GAYA', 'BHAGALPUR', 'DARBHANGA', 'MUZAFFARPUR'],
      "PATNA": {
        "districts": ['PATNA', 'NALANDA', 'BHOJPUR', 'BUXAR'],
        "PATNA": ['BIHTA', 'SAMPATCHAL', 'PHULWARI', 'BAKHTIYARPUR', 'DINAPUR', 'MANER', 'PUNPUN', 'KHUSRUPUR', 'FATUHA', 'DHANARUA', 'BELCHCHI', 'PALIGANJ', 'ATHAMALGOLA', 'PANDARAK', 'BARH', 'MOKAMA', 'DULHIN BAZAR', 'MASAURHI', 'BIKRAM', 'NAUBATPUR', 'PATNA SADAR', 'GHOSWARI', 'DANIYAWAN'],
        "NALANDA": ['ISLAMPUR', 'BIND', 'KATRISARAI', 'HARNAUT', 'RAJGIR', 'RAHUI', 'NOORSARAI', 'NAGAR NAUSA', 'BIHARSHARIF', 'SILAO', 'HILSA', 'EKANGARSARI', 'GIRIAK', 'KARAI PARUSURAI', 'THARTHARI', 'CHANDI', 'PARBALPUR', 'SARMERA', 'BEN', 'ASTHAWAN'],
        "BHOJPUR": ['AGIAON', 'SHAHPUR', 'SANDESH', 'BARHARA', 'SAHAR', 'ARA', 'KOLIWAR', 'BEHEA', 'TARARI', 'PIRO', 'CHARPOKHARI', 'UDWANTNAGAR', 'GARHANI', 'JAGDISHPUR'],
        "BUXAR": ['NAWANAGAR', 'BRAHMPUR', 'DUMRAON', 'CHAUSA', 'CHOUGAIN', 'ITARHI', 'RAJPUR', 'BUXAR', 'SIMRI', 'KESATH', 'CHAKKI']
      },
      "GAYA": {
        "districts": ['ROHTAS', 'NAWADA', 'ARWAL', 'GAYA', 'JEHANABAD', 'AURANGABAD', 'KAIMUR(BHABUA)'],
        "ROHTAS": ['SURAJPURA', 'SANJHOULI', 'DINARA', 'CHENARI', 'NAWHATTA', 'DEHRI', 'BIKRAMGANJ', 'ROHTAS', 'KOCHAS', 'NOKHA', 'TILOUTHU', 'NASRIGANJ', 'RAJUPUR', 'SASARAM', 'KARAKAT', 'KARGAHAR', 'DAWATH', 'AKHORIGOLA', 'SHEOSAGAR'],
        "NAWADA": ['MESCAUR', 'NARHAT', 'NARDIGANJ', 'AKBARPUR', 'GOBINDPUR', 'ROH', 'KASHICHAK', 'RAJAULI', 'PAKRI BARAWAN', 'NAWADA', 'WARISALIGANJ', 'SIRDALA', 'KAWAKOLE', 'HISUA'],
        "ARWAL": ['ARWAL', 'KALER', 'KAPRI', 'KURTHA', 'SONBHADRA-BANSI-SURAJPUR'],
        "GAYA": ['DUMARIA', 'KHIZARSARAI', 'MOHRA', 'GURARU', 'IMAMGANJ', 'BARACHATTI', 'BODHGAYA', 'ATRI', 'AMAS', 'PARAIYA', 'WAZIRGANJ', 'SHERGHATTY', 'FATEHPUR', 'MOHANPUR', 'NEEMCHAK BATHANI', 'MANPUR', 'KONCH', 'BELAGANJ', 'GAYA TOWN', 'TEKARI', 'BANKEY BAZAR', 'TANKUPPA', 'DOBHI'],
        "JEHANABAD": ['KAKO', 'JEHANABAD', 'RATNI FARIDPUR', 'GHOSHI', 'HULASGNAJ', 'MODANGANJ', 'MAKHUMPUR'],
        "AURANGABAD": ['HASPURA', 'KUTUMBA', 'GOH', 'BARUN', 'RAFIGANJ', 'NABINAGAR', 'DEO', 'DAUDNAGAR', 'MADANPUR', 'AURANGABAD', 'OBRA'],
        'KAIMUR(BHABUA)': ['RAMGARH', 'ADHAURA', 'KUDRA', 'BHABUA', 'RAMPUR', 'DURGAWATI', 'MOHANIA', 'BHAGWANPUR', 'CHAND', 'CHAINPUR', 'NUAON']
      },
      "BHAGALPUR": {
        "districts": ['SHEIKHPURA', 'MUNGER', 'BANKA', 'LAKSHISARAI', 'BHAGALPUR', 'ARARIA', 'PURNIA', 'JAMUI', 'KATIHAR', 'KISHANGANJ'],
        "SHEIKHPURA": ['ARIARI', 'BARBIGHA', 'CHEWARA', 'GHAT KUSUMBHA', 'SHEIKHOPUR SARAI', 'SHEIKHPURA'],
        "MUNGER": ['DHARHARA', 'JAMALPUR', 'SANGRAMPUR', 'TETIABAMBAR', 'MUNGER SADAR', 'BARIYARPUR', 'TARAPUR', 'ASARGANJ', 'KHARAGPUR'],
        "BANKA": ['CHANNAN', 'KATORIA', 'AMARPUR', 'BELHAR', 'DHURAIYA', 'BAUSI', 'BANKA', 'BARAHAT', 'FULLIDUMAR', 'RAJAUN', 'SHAMBHUGANJ'],
        "LAKSHISARAI": ['BARAHIYA', 'CHANNAN', 'HALSI', 'LAKHISARAI', 'PIPARIYA', 'RAMGARH CHOWK', 'SURAJGARHA'],
        "BHAGALPUR": ['NARAYANPUR', 'GORADIH', 'PIRPAINTI', 'NAUGACHHIA', 'KHARIK', 'SABOUR', 'KAHALGAON', 'RANGRACHOWK', 'ISMAILPUR', 'GOPALPUR', 'SULTANGANJ', 'NATHNAGAR', 'SONHAULA', 'JAGDISHPUR', 'BIHPUR', 'SHAHKUND'],
        "ARARIA": ['RANIGANJ', 'FORBESGANJ', 'KURSAKAΝΤΑ', 'PALASI', 'NARPATGANJ', 'BHARGAMA', 'JOKIHAT', 'SIKTY', 'ARARIA'],
        "PURNIA": ['RUPOULI', 'SRINAGAR', 'AMOUR', 'BAISA', 'BANMANKHI', 'PURNIA EAST', 'BARHARA', 'DAGRAUA', 'BAISI', 'KRITYANAND NAGAR', 'DHAMDAHA', 'JALALGARH', 'KASBA', 'BHAWANIPUR'],
        "JAMUI": ['BARHAT', 'SIKANDRA', 'ISLAMNAGAR ALIGANJ', 'JAMUI', 'JHAJHA', 'SONO', 'KHAIRA', 'LAXMIPUR', 'GIDHOR', 'CHAKAI'],
        "KATIHAR": ['MANIHARI', 'DANDKHORA', 'KADWA', 'BALRAMPUR', 'KORHA', 'FALKA', 'SAMELI', 'HASANGANJ', 'KURSELA', 'MANSAHI', 'KATIHAR', 'AZAMNAGAR', 'BARARI', 'PRANPUR', 'BARSOI', 'AMDABAD'],
        "KISHANGANJ": ['POTHIA', 'BAHADURGANJ', 'THAKURGANJ', 'DIGHALBANK', 'KOCHADHAMAN', 'TERHAGACHH', 'KISHANGANJ']
      },
      "DARBHANGA": {
        "districts": ['BEGUSARAI', 'SAHARSA', 'DARBHANGA', 'MADHEPURA', 'SAMASTIPUR', 'MADHUBANI', 'SUPAUL', 'KHAGARIA'],
        "BEGUSARAI": ['GADHUPURA', 'SAHEBPUR KAMAL', 'BARAUNI', 'DANDARI', 'CHERIA BARIARPUR', 'BEGUSARAI', 'NAWKOTHI', 'KHODAWANDPUR', 'BALLIA', 'BAKHRI', 'TEGHRA', 'BIRPUR', 'BHAGWANPUR', 'SAMHO AKHA KURHA', 'MANSURCHAK', 'CHHAURAHI', 'BACHHWARA', 'MATIHANI'],
        "SAHARSA": ['SOUR BAZAR', 'KAHARA', 'NAUHATTA', 'SONBARSA', 'BANMA ITAHARI', 'SATTAR KATTAIYA', 'SALKHUA', 'PATARGHAT', 'MAHISHI', 'SIMRI BAKHTIARPUR'],
        "DARBHANGA": ['GHANSHYAMPUR', 'KUSHESWAR ASTHAN EAST', 'KUSHESHWAR ASTHAN', 'DARBHANGA', 'JALE', 'HAYAGHAT', 'BIRAUL', 'SINGHWARA', 'TARDIH', 'MANIGACHHI', 'HANUMAN NAGAR', 'BENIPUR', 'BAHERI', 'GAURABAURAM', 'KEOTIRUNWAY', 'ALINAGAR', 'BAHADURPUR', 'KIRATPUR'],
        "MADHEPURA": ['UDA KISHANGANJ', 'PURANI', 'GHELARH', 'GAMHARIYA', 'SHANKARPUR', 'CHAUSA', 'ALAMNAGAR', 'SINGHESHWAR', 'GWALPARA', 'MADHEPURA', 'KUMARKHAND', 'BIHARIGANJ', 'MURLIGANJ'],
        "SAMASTIPUR": ['WARISNAGAR', 'BITHAN', 'SARAIRANJAN', 'DALSINGHSARA', 'KHANPUR', 'MOHIUDDINAGAR', 'VIDYAPATI NAGAR', 'PATORI', 'MORWA', 'KALYANPUR', 'ROSERA', 'HASANPUR', 'TAJPUR', 'SAMASTIPUR', 'MOHANPUR', 'BIBHUTPUR', 'PUSA', 'SHIVAJI NAGAR', 'SINGHIA', 'UJIARPUR'],
        "MADHUBANI": ['PHULPARAS', 'LAUKAHA (KHUTAUNA)', 'RAJNAGAR', 'LADANIA', 'PANDAUL', 'KALUAHI', 'NIRMALI', 'MADHWAPUR', 'MADHEPUR', 'JHANJHARPUR', 'BABU BARHI', 'GHOGHARDIHA', 'BENIPATTI', 'KHAJAULI', 'BISFI', 'LAKHNAUR', 'RAHIKA', 'MADHUBANI', 'BASOPATTI', 'MARAUNA', 'ANDHRATHARHI', 'LAUKAHI', 'HARLAKHI', 'JAINAGAR'],
        "SUPAUL": ['BASANTPUR', 'TRIBENIGANJ', 'KISHANPUR', 'NIRMALI', 'PRATAPGANJ', 'SUPAUL', 'SARAIGARH BHARTIYAHI', 'RAGHOPUR', 'CHHATAPUR', 'PIPRA'],
        "KHAGARIA": ['MANSI', 'GOGRI', 'KHAGARIA', 'BELDAUR', 'CHAUTHAM', 'PARBATTA', 'ALAULI']
      },
      "MUZAFFARPUR": {
        "districts": ['SIWAN', 'SITAMARHI', 'VAISHALI', 'PASHCHIM CHAMPARAN', 'SHEOHAR', 'GOPALGANJ', 'PURBI CHAMPARAN', 'MUZAFFARPUR', 'SARAN'],
        "SIWAN": ['SIWAN', 'GUTHANI', 'MAIRWA', 'BHAGWANPUR HAT', 'DARAULI', 'SISWAN', 'DARAUNDHA', 'RAGHUNATHPUR', 'HUSSAINGANJ', 'BARHARIA', 'ANDAR', 'BASANTPUR', 'MAHARAJGANJ', 'NAUTAN', 'ZIRADEI', 'PACHRUKHI', 'HASAN PURA', 'GORIAKOTHI', 'LAKRI NABIGANJ'],
        "SITAMARHI": ['PARSAUNI', 'RUNNISAIDPUR', 'BATHANAHA', 'PUPRI', 'SUPPI', 'SURSAND', 'SONBARSA', 'BAJPATTI', 'MAJORGANJ', 'CHORAUT', 'BOKHRA', 'NANPUR', 'PARIHAR', 'RIGA', 'BELSAND', 'BAIRGANIA', 'DUMRA'],
        "VAISHALI": ['SAHDEI BUZURG', 'MAHNAR', 'HAJIPUR', 'BIDUPUR', 'VAISHALI', 'MAHUA', 'PATEDHI BELSAR', 'RAJAPAKAR', 'CHEHRAKALA', 'JANDAHA', 'RAGHOPUR', 'PATEPUR', 'GARAUL', 'BHAGWANPUR', 'DESRI', 'LALGANJ'],
        'PASHCHIM CHAMPARAN': ['SIKTA', 'THAKRAHAN', 'MAJHAULIA', 'PIPRASI', 'BETTIAH', 'MAINATAND', 'LAURIYA', 'BAGAHA-II', 'NARKATIAGANJ', 'NAUTAN', 'RAMNAGAR', 'BAGAHA-I', 'CHANPATIA', 'GAUNAHA', 'BAIRIA', 'MADHUBANI', 'JOGAPATTI'],
        "SHEOHAR": ['DUMARI KATSARI', 'PIPRAHI', 'PURNAHIYA', 'SHEOHAR', 'TARIYANI'],
        "GOPALGANJ": ['BHOREY', 'GOPALGANJ', 'KATAIYA', 'UCHKAGAON', 'MANJHA', 'SIDHWALIYA', 'PHULWARIYA', 'PANCHDEORI', 'KUCHAIKOTE', 'BARAULI', 'BAIKUNTHPUR', 'HATHUA', 'THAWE', 'BIJAIPUR'],
        'PURBI CHAMPARAN': ['CHAWRADANO', 'BANJARIYA', 'TETARIYA', 'GHORASAHAN', 'MEHSI', 'RAXAUL', 'RAMGARHWA', 'CHIRAIYA', 'KESARIA', 'ADAPUR', 'KOTWA', 'SUGAULI', 'TURKAULIA', 'KALYANPUR', 'PATAHI', 'SANGRAMPUR', 'DHAKA', 'HARSIDHI', 'PAKRIDAYAL', 'MADHUBAN', 'ARERAJ', 'BANKATWA', 'CHAKIA (PIPRA)', 'MOTIHARI', 'PAHARPUR', 'PIPRA KOTHI', 'PHENHARA'],
        "MUZAFFARPUR": ['MURAUL', 'SARAIYA', 'GAIGHAT', 'BOCHAHAN', 'MOTIPUR', 'KURHANI', 'SAHEBGANJ', 'BANDRA', 'MARWAN', 'PAROO', 'KANTI', 'KATRA', 'AURAI', 'MINAPUR', 'SAKRA', 'MUSHAHARI'],
        "SARAN": ['TARAIYA', 'ISUAPUR', 'MARHAURAH', 'BANIAPUR', 'NAGRA', 'DIGHWARA', 'MAKER', 'SONEPUR', 'CHHAPRA', 'GARKHA', 'MASHRAKΗ', 'PARSA', 'JALALPUR', 'EKMA', 'MANJHI', 'AMNOUR', 'DARIAPUR', 'LAHLADPUR', 'PANAPUR', 'REVELGANJ']
      }
    }
  }

class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing tasks
    """
    queryset = Task.objects.all().select_related('assigned_to')
    serializer_class = TaskSerializer
    authentication_classes = [TokenAuthentication]

    # permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                "message": "Task created successfully",
                "task": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_serializer_class(self):
        print("Fetching serializer class")  
        """
        Use different serializers for different actions
        """
        if self.action == 'create':
            return TaskCreateSerializer
        elif self.action == 'update' or self.action == 'partial_update':
            # For full updates, still use the main serializer
            if self.request.data and len(self.request.data) == 1 and 'status' in self.request.data:
                return TaskUpdateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        print("Performing task creation")
        """
        Set any additional fields on creation
        """
        serializer.save()
    def create(self, request, *args, **kwargs):
        print("🔁 Custom create() called")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "message": "Task created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def perform_destroy(self, instance):
        print("🔁 Performing task deletion")
        instance.delete()

    def delete(self, request, *args, **kwargs):
        print("🔁 Custom delete() called")
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "message": "Task deleted successfully"
        }, status=status.HTTP_204_NO_CONTENT)

    def pefrom_put(self, serializer):
        print("🔁 Performing task update")
        """
        Set any additional fields on update
        """
        serializer.save()
    def put(self, request, *args, **kwargs):
        print("🔁 Custom put() called")
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "message": "Task updated successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    


    def pefrom_alltasks(self, serializer):
        print("🔁 Performing task retrieval")
        """
        Set any additional fields on retrieval
        """
        serializer.save()
    @action(detail=False, methods=['get'])
    def all_tasks(self, request, *args, **kwargs):
        print("🔁 Custom AllTasks() called")
        """
        Retrieve all tasks
        """ 
        print("🔁 Custom AllTasks() called")
        tasks = self.get_queryset()
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        print("Fetching tasks for user")
        """
        Filter tasks assigned to the current user
        """
        # In a real app, you'd use request.user
        # For demo, we'll use a query parameter
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"error": "user_id parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tasks = self.queryset.filter(assigned_to_id=user_id)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_milestone(self, request):
        print("Fetching tasks by milestone")
        """
        Filter tasks by milestone
        """
        milestone = request.query_params.get('milestone')
        if not milestone:
            return Response(
                {"error": "milestone parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tasks = self.queryset.filter(milestone=milestone)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """
        Filter tasks by location hierarchy
        """
        state = request.query_params.get('state')
        business_area = request.query_params.get('business_area')
        district = request.query_params.get('district')
        block = request.query_params.get('block')
        
        filters = {}
        if state:
            filters['state'] = state
        if business_area:
            filters['business_area'] = business_area
        if district:
            filters['district'] = district
        if block:
            filters['block'] = block
        
        if not filters:
            return Response(
                {"error": "At least one location parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        tasks = self.queryset.filter(**filters)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for user data (read-only)
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer


class MilestoneViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for milestone data (read-only)
    """
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer


@api_view(['GET'])
def get_assigned_tasks(request, user_id):
    # Check if the user exists
    user = get_object_or_404(User, id=user_id)  
    tasks = Task.objects.filter(assigned_to=user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def all_tasks_view(request):
    print("🔁 all_tasks_view called")
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PATCH'])
def update_task_status(request, pk):
    """
    Update only the status of a task
    """
    task = get_object_or_404(Task, pk=pk)
    
    # In a real app, you'd check permissions
    # For example: if task.assigned_to != request.user:
    #                 return Response({"error": "Not authorized"}, status=403)
    
    serializer = TaskUpdateSerializer(task, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        # Return full task data after update
        return Response(TaskSerializer(task).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_states(request):
    """Get all available states"""
    return Response(LOCATION_DATA.get('states', []))


@api_view(['GET'])
def get_business_areas(request, state):
    """Get business areas for a specific state"""
    if state not in LOCATION_DATA:
        return Response([], status=status.HTTP_404_NOT_FOUND)
    
    return Response(LOCATION_DATA.get(state, {}).get('businessAreas', []))


@api_view(['GET'])
def get_districts(request, state, business_area):
    """Get districts for a specific state and business area"""
    if state not in LOCATION_DATA or business_area not in LOCATION_DATA.get(state, {}):
        return Response([], status=status.HTTP_404_NOT_FOUND)
    
    return Response(LOCATION_DATA.get(state, {}).get(business_area, {}).get('districts', []))


@api_view(['GET'])
def get_blocks(request, state, business_area, district):
    """Get blocks for a specific location hierarchy"""
    if (state not in LOCATION_DATA or 
        business_area not in LOCATION_DATA.get(state, {}) or
        district not in LOCATION_DATA.get(state, {}).get(business_area, {})):
        return Response([], status=status.HTTP_404_NOT_FOUND)
    
    return Response(LOCATION_DATA.get(state, {}).get(business_area, {}).get(district, []))


@api_view(['GET'])
def task_summary(request):
    print("Fetching task summary")
    """
    Get summary statistics about tasks
    """
    total_tasks = Task.objects.count()
    completed_tasks = Task.objects.filter(status='completed').count()
    in_progress_tasks = Task.objects.filter(status='in_progress').count()
    nil_tasks = Task.objects.filter(status='nil').count()
    
    # Calculate completion percentage
    completion_percentage = (
        (completed_tasks / total_tasks) * 100 
        if total_tasks > 0 else 0
    )
    
    # Tasks due soon (within next 7 days)
    today = timezone.now().date()
    week_ahead = today + timezone.timedelta(days=7)
    due_soon = Task.objects.filter(
        status='in_progress',
        estimated_end_date__range=[today, week_ahead]
    ).count()
    
    # Tasks by state
    tasks_by_state = list(Task.objects.values('state')
                         .annotate(count=Count('id'))
                         .order_by('-count'))
    
    return Response({
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'in_progress_tasks': in_progress_tasks,
        'nil_tasks': nil_tasks,
        'completion_percentage': round(completion_percentage, 2),
        'due_soon': due_soon,
        'tasks_by_state': tasks_by_state
    })


@api_view(['GET'])
def milestone_progress(request):
    """
    Get progress information for each milestone
    """
    milestones_data = []
    
    # Milestone choices from Task model
    milestone_choices = dict(Task.MILESTONE_CHOICES)
    
    for code, name in milestone_choices.items():
        total = Task.objects.filter(milestone=code).count()
        completed = Task.objects.filter(milestone=code, status='completed').count()
        in_progress = Task.objects.filter(milestone=code, status='in_progress').count()
        nil = Task.objects.filter(milestone=code, status='nil').count()
        
        # Calculate percentage
        percentage = (completed / total) * 100 if total > 0 else 0
        
        milestones_data.append({
            'code': code,
            'name': name,
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'nil': nil,
            'percentage': round(percentage, 2)
        })
    
    return Response(milestones_data)


@api_view(['GET'])
def get_current_user(request):
    print("Fetching current user")
    """
    Get information about the currently logged-in user
    In a real application, this would use request.user
    For demo purposes, we'll accept a user_id parameter
    """
    # In real app: user = request.user
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response(
            {"error": "Not authenticated"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )