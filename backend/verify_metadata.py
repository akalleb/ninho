import sys
import os
sys.path.insert(0, os.getcwd())
from app.database import Base
from app import models

print("Tables in metadata:", list(Base.metadata.tables.keys()))
