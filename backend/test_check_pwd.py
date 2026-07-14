import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
from app.controllers.auth_controller import check_password

hashed = '$2b$12$d343PcV02nYMXx7wK6.lded1qxhdo3TRs.HSNgFvL4ZhlvrTZJPcK'
print('Result:', check_password('Kolhapur@2304', hashed))
