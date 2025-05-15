from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

app = Flask(__name__)

# Load and prepare the data
def load_data():
    training = pd.read_csv('Data/Training.csv')
    testing = pd.read_csv('Data/Testing.csv')
    
    cols = training.columns[:-1]
    x = training[cols]
    y = training['prognosis']
    
    # Label encoding
    le = preprocessing.LabelEncoder()
    le.fit(y)
    y = le.transform(y)
    
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)
    
    # Train models
    dt = DecisionTreeClassifier()
    dt.fit(x_train, y_train)
    
    svm = SVC()
    svm.fit(x_train, y_train)
    
    return dt, svm, le, cols

# Load descriptions and precautions
def load_descriptions():
    desc_dict = {}
    with open('MasterData/symptom_Description.csv', 'r') as f:
        next(f)  # Skip header
        for line in f:
            disease, desc = line.strip().split(',', 1)
            desc_dict[disease] = desc
    return desc_dict

def load_precautions():
    prec_dict = {}
    with open('MasterData/symptom_precaution.csv', 'r') as f:
        next(f)  # Skip header
        for line in f:
            parts = line.strip().split(',')
            disease = parts[0]
            precautions = [p for p in parts[1:] if p]
            prec_dict[disease] = precautions
    return prec_dict

def load_severity():
    sev_dict = {}
    with open('MasterData/Symptom_severity.csv', 'r') as f:
        next(f)  # Skip header
        for line in f:
            try:
                symptom, severity = line.strip().split(',')
                sev_dict[symptom] = int(severity)
            except:
                continue
    return sev_dict

# Initialize models and data
print("Loading data and training models...")
dt_model, svm_model, label_encoder, symptoms = load_data()
print("Loading descriptions and precautions...")
descriptions = load_descriptions()
precautions = load_precautions()
severity_dict = load_severity()
print("System ready!")

@app.route('/')
def home():
    # Convert symptoms to list and sort alphabetically
    symptom_list = sorted(list(symptoms))
    return render_template('index.html', symptoms=symptom_list)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get selected symptoms from form
        selected_symptoms = request.form.getlist('symptoms[]')
        
        if not selected_symptoms:
            return jsonify({'error': 'Please select at least one symptom'})
        
        # Create input vector
        input_vector = np.zeros(len(symptoms))
        for symptom in selected_symptoms:
            if symptom in symptoms:
                input_vector[list(symptoms).index(symptom)] = 1
        
        # Get predictions
        dt_pred = label_encoder.inverse_transform([dt_model.predict([input_vector])[0]])[0]
        svm_pred = label_encoder.inverse_transform([svm_model.predict([input_vector])[0]])[0]
        
        # Calculate severity
        severity = sum(severity_dict.get(symptom, 0) for symptom in selected_symptoms)
        severity = round((severity / len(selected_symptoms)) if selected_symptoms else 0, 2)
        
        # Prepare response
        response = {
            'dt_prediction': dt_pred,
            'svm_prediction': svm_pred,
            'severity': severity,
            'description': descriptions.get(dt_pred, "No description available"),
            'precautions': precautions.get(dt_pred, ["No specific precautions available"]),
            'selected_symptoms': selected_symptoms
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    print("Starting Disease Prediction System...")
    app.run(debug=True) 