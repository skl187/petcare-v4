# Execute the SQL file inside the container
docker exec -i postgresql psql -U dbadmin -d bracedb26 -f ./sql/schema.sql

# from local to container
docker exec -i postgresql psql -U dbadmin -d bracedb26 < ./schema.sql
docker exec -i postgresql psql -U dbadmin -d bracedb26 < ./seed.sql

# create use at db
docker exec -it <container_name> psql -U postgres -c "CREATE ROLE dbadmin WITH LOGIN PASSWORD 'your_password_here' SUPERUSER;"

# reset psw
docker exec -it postgresql psql -U dbadmin

docker exec -it postgresql psql -U postgres -c "CREATE ROLE dbadmin WITH LOGIN PASSWORD 'dbpswd12' SUPERUSER;"




src/
├── core/
│   └── rbac/
│       ├── rbac.service.js          ← Permission checking logic
│       └── rbac.middleware.js        ← Authorization middleware
├── modules/
│   └── appointments/
│       ├── appointments.routes.js    ← Routes with RBAC
│       └── appointments.controller.js ← Business logic
└── app.js