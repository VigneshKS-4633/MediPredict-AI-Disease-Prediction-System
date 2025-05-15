# MediPredict AI - Intelligent Disease Prediction System

This is an intelligent Disease Prediction System that uses Machine Learning to predict possible diseases based on symptoms provided by users.

## Features

- Interactive symptom input system
- Disease prediction using Decision Trees and SVM
- Severity assessment of conditions
- Precautionary measures recommendation
- Detailed disease descriptions
- Voice feedback capability

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure you have the following data files in the correct directories:
   - `Data/Training.csv`
   - `Data/Testing.csv`
   - `MasterData/symptom_Description.csv`
   - `MasterData/symptom_severity.csv`
   - `MasterData/symptom_precaution.csv`

3. Run the application:
```bash
python da.py
```

## How to Use

1. Launch the application
2. Enter your name when prompted
3. Input symptoms you are experiencing
4. Specify how many days you've had the symptoms
5. Answer additional questions about related symptoms
6. Receive disease prediction and recommendations

## Technical Details

The system uses multiple machine learning models:
- Decision Tree Classifier for primary prediction
- Support Vector Machine (SVM) for validation
- Cross-validation for accuracy assessment

## Data Sources

The system uses various CSV files for:
- Training data with symptom-disease mappings
- Testing data for model validation
- Symptom severity information
- Disease descriptions
- Precautionary measures 