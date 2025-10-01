from rest_framework.decorators import api_view, permission_classes,parser_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated,IsAdminUser
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import SignupSerializer, LoginSerializer, FormSerializer,SubmissionSerializer,RolesSerializer,UsersSerializer,SimpleFormSerializer,FormAssignmentSerializer
from .models import Form,Submission,Roles
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt


@api_view(['POST'])
@permission_classes([AllowAny])
def sigup_api(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data.get('user', None)
        if user is None:
            raise AuthenticationFailed('Email does not exist')
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'username': user.username,
                'email': user.email
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_users(request):
    try:
        forms_count = User.objects.count()
        return Response(
            {"count": forms_count}, 
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to count forms: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def forms_list_create_api(request):
        serializer = FormSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Remove created_by parameter since it's handled in the serializer
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_forms(request):
    try:
        forms_count = Form.objects.count()
        return Response(
            {"count": forms_count}, 
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to count forms: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def form_detail_api(request, id):
    form = get_object_or_404(Form, id=id)

    if request.method == 'GET':
        serializer = FormSerializer(form)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = FormSerializer(form, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        form.delete()
        return Response({"message": "Form deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def submit_form_api(request, id):
    form = get_object_or_404(Form, id=id)
    raw_data = request.data.copy()
    formatted_data = {}
    file_obj = None

    for key, value in raw_data.items():
        # ✅ Detect file uploads
        if hasattr(value, "size"):
            file_obj = value  # store file
            formatted_data[key] = value.name  # keep filename in JSON if needed
        else:
            formatted_data[key] = value

    serializer = SubmissionSerializer(
        data={
            "form": form.id,
            "data": formatted_data,
            "file_upload": file_obj,
        },
        context={"request": request},
    )

    if serializer.is_valid():
        submission = serializer.save()
        return Response(
            {
                "message": "✅ Form submitted successfully",
                "submission_id": submission.id,
                "data": serializer.data,  # ✅ includes full file URL now
            },
            status=status.HTTP_201_CREATED,
        )

    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def submissions_api(request):
    user = request.user
    if user.is_superuser and user.is_staff:
        submissions = Submission.objects.all().order_by('-created_at')
    else:
        submissions = Submission.objects.filter(submitted_by=user).order_by('-created_at')
    serializer = SubmissionSerializer(submissions, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def count_submissions(request):
    user = request.user
    try:
        if user.is_superuser and user.is_staff:
            submissions_count = Submission.objects.count()
        else:
            submissions_count = Submission.objects.filter(submitted_by=user).count()

        return Response({"count": submissions_count}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"error": f"Failed to count submissions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def roles_list(request):
        serializer = RolesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    users = User.objects.all()
    serializer = UsersSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def available_forms(request):
    forms = Form.objects.filter(is_active=True)
    serializer = SimpleFormSerializer(forms, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_form(request):
    serializer = FormAssignmentSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_forms(request):
    user = request.user
    if user.is_superuser and user.is_staff:
        forms = Form.objects.all().order_by('-created_at')
    else:
        forms = Form.objects.filter(assignments__users=user).distinct().order_by('-created_at')
    serializer = FormSerializer(forms, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mydataapi(request):
    user = request.user
    data = {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "is_superuser": user.is_superuser,
        "is_staff": user.is_staff,}
    return Response(data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        if user == request.user:
            return Response({"detail": "You cannot delete yourself."}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"detail": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
