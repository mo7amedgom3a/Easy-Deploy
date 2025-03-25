from models.user import User
from repositories.user import UserRepository
from services.user import UserService
from interfaces.user_interface import UserRepository
from models.user import User
from services.user import UserService

def test_create_user():
    user = User(name="John Doe", age=30, phone="1234567890", email="john.doe@example.com")
    user_repository = UserRepository()
    user_service = UserService(user_repository)
    created_user = user_service.create_user(user)
    assert created_user is not None
    assert created_user.id is not None
    assert created_user.name == "John Doe"
    assert created_user.age == 30
    assert created_user.phone == "1234567890"
    assert created_user.email == "john.doe@example.com"

def test_get_user_by_id():
    user_repository = UserRepository()
    user_service = UserService(user_repository)
    created_user = user_service.create_user(User(name="John Doe", age=30, phone="1234567890", email="john.doe@example.com"))
    user = user_service.get_user_by_id(created_user.id)
    assert user is not None
    assert user.id == created_user.id
    assert user.name == "John Doe"
    assert user.age == 30

def test_get_all_users():
    user_repository = UserRepository()
    user_service = UserService(user_repository)
    created_user = user_service.create_user(User(name="John Doe", age=30, phone="1234567890", email="john.doe@example.com"))
    users = user_service.get_all_users()
    assert len(users) == 1
    assert users[0].id == created_user.id
    assert users[0].name == "John Doe"
    assert users[0].age == 30
    assert users[0].phone == "1234567890"
    assert users[0].email == "john.doe@example.com"


