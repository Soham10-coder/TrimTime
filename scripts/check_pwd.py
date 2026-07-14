from app.controllers.auth_controller import check_password

hashed = '$2b$12$d343PcV02nYMXx7wK6.lded1qxhdo3TRs.HSNgFvL4ZhlvrTZJPcK'
print('Check:', check_password('Kolhapur@2304', hashed))
