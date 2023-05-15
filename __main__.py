""" 人臉辨識 """


from functions import Database

if __name__ == "__main__":
    
    db = Database(r"data\\haarcascade_frontalface_default.xml")
    db.takePics(5)
    db.buildDB()
    db.login()