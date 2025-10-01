from django.urls import path
from.import views


urlpatterns = [
    path('signup/', views.sigup_api, name='signup'),
    path('login/', views.login_api, name='login'),
    path('create/', views.forms_list_create_api, name='forms-list-create'),

    path('user-forms/', views.user_forms, name='user-forms'), 

    path('<int:id>/', views.form_detail_api, name='form-detail'),
    path('<int:id>/submit/', views.submit_form_api, name='form-submit'),

    path('submissions/', views.submissions_api, name='submissions'),
    path('count-users/', views.count_users, name='count-users'),
    path('count-forms/', views.count_forms, name='count-forms'),
    path('count-submissions/', views.count_submissions, name='count-submissions'),
    path('roles/', views.roles_list, name='roles-list'),
    path('users/', views.users_list, name='users-list'),

    path('forms/available/', views.available_forms, name='available-forms'),             
    path('forms/assign/', views.assign_form, name='assign-form'),  

    path('me/', views.mydataapi, name='me_api'),   

    path('delete-user/<int:user_id>/', views.delete_user, name='delete-user'),

]