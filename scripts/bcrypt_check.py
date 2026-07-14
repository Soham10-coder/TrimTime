import bcrypt
hashed = b'$2b$12$d343PcV02nYMXx7wK6.lded1qxhdo3TRs.HSNgFvL4ZhlvrTZJPcK'
password = b'Kolhapur@2304'
print('bcrypt check:', bcrypt.checkpw(password, hashed))
