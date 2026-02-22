import os
from dotenv import load_dotenv
load_dotenv()
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq

class Extraction(BaseModel):
    location: str
    intent: str

llm = ChatGroq(model='llama-3.1-8b-instant', temperature=0).with_structured_output(Extraction)
print(llm.invoke('whats the weather in tkyio'))
