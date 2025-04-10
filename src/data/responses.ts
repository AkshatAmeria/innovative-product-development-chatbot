import { EmergencyResponse } from '../types';

export const emergencyResponses: EmergencyResponse[] = [
  {
    category: 'FIRE',
    responses: [
      "Evacuate the building immediately!",
      "Call emergency services (911/112) right away",
      "Do not use elevators during a fire emergency",
      "Stay low to avoid smoke inhalation",
      "Meet at your designated assembly point"
    ]
  },
  {
    category: 'GAS',
    responses: [
      "Evacuate the area immediately",
      "Do not turn on/off any electrical switches",
      "Do not use your phone while inside the building",
      "Call emergency services from a safe distance",
      "Do not attempt to locate the leak yourself"
    ]
  },
  {
    category: 'THEFT',
    responses: [
      "Ensure you're in a safe location",
      "Call the police immediately",
      "Do not confront the perpetrator",
      "Document everything you can remember",
      "Lock all doors and windows if safe to do so"
    ]
  },
  {
    category: 'MEDICAL',
    responses: [
      "Call emergency medical services immediately",
      "Stay with the patient if safe to do so",
      "Check for breathing and consciousness",
      "Follow dispatcher instructions",
      "Have someone meet emergency responders"
    ]
  }
];