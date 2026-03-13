from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "백엔드 서버가 정상 동작 중입니다."}


@app.get("/health")
def health_check():
    return {"status": "ok"}