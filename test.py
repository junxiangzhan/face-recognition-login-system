from functions import Database

db = Database(r"data\\haarcascade_frontalface_default.xml")

db.takePics(5)
db.buildDB()
db.login()