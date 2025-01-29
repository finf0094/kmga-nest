curl -X POST -H "Content-Type: application/json" -d '{
"email": "admin@gmail.com",
"password": "tete9291",
"passwordRepeat": "tete9291"
}' http://localhost:3000/api/auth/register