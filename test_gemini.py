import os
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI

class Extraction(BaseModel):
    location: str = Field(description="The city name, fixed for typos")
    intent: str = Field(description="'current_weather' or 'forecast' or 'activity'")

os.environ["GOOGLE_API_KEY"] = open(".env").read().split("=")[1].strip()
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash").with_structured_output(Extraction)

print(llm.invoke("whats the weather in tkyio").model_dump())
