import api from './api';

export const visitService = {
  // Get all visits
  getVisits: async (params = {}) => {
    try {
      const response = await api.get('/visits', { params });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visits' };
    }
  },

  // Get single visit
  getVisit: async (id) => {
    try {
      const response = await api.get(`/visits/${id}`);
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visit' };
    }
  },

  // Create new visit
  createVisit: async (visitData) => {
    try {
      const response = await api.post('/visits', visitData);
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create visit' };
    }
  },

  // Update visit status
  updateVisitStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/visits/${id}/status`, { status, notes });
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update visit status' };
    }
  },

  // Get pending visits for checker doctor
  getPendingVisits: async () => {
    try {
      const response = await api.get('/checker/visits/pending');
      return { success: true, data: response.data.data.visits };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pending visits' };
    }
  },

  // Get visits with lab results for main doctor
  getVisitsWithLabResults: async () => {
    try {
      const response = await api.get('/prescriptions/visits/lab-done');
      return { success: true, data: response.data.data.visits };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch lab done visits' };
    }
  },

  // Update visit with checker doctor data
  updateVisitChecker: async (id, symptoms, labTests) => {
    try {
      const response = await api.put(`/checker/visits/${id}/checker`, { symptoms, labTests });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update visit' };
    }
  },

  // Direct diagnosis without lab tests
  updateVisitDirect: async (id, symptoms, diagnosis) => {
    try {
      const response = await api.put(`/checker/visits/${id}/direct`, { symptoms, diagnosis });
      return { success: true, data: response.data.data.visit };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update visit' };
    }
  },

  // Get visit statistics
  getVisitStats: async () => {
    try {
      const response = await api.get('/visits/stats/overview');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch visit statistics' };
    }
  },

  // Get visits assigned to checker doctor
  getCheckerDoctorVisits: async () => {
    try {
      const response = await api.get('/checker/visits');
      return { success: true, data: response.data.data.visits };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch checker doctor visits' };
    }
  },

  // Get checker doctor statistics
  getCheckerDoctorStats: async () => {
    try {
      const response = await api.get('/checker/stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch checker doctor statistics' };
    }
  },

  // Save symptoms and lab tests
  saveSymptomsAndLabTests: async (visitId, assessmentData) => {
    try {
      const { symptoms, vitalSigns, notes, recommendedLabTests } = assessmentData;
      
      // Convert recommended lab tests to lab test format
      const labTests = recommendedLabTests.map(testId => {
        const testMap = {
          'blood_test': { testName: 'Blood Test', testType: 'blood', cost: 50 },
          'urine_test': { testName: 'Urine Test', testType: 'urine', cost: 25 },
          'xray': { testName: 'X-Ray', testType: 'xray', cost: 100 },
          'ct_scan': { testName: 'CT Scan', testType: 'ct', cost: 300 },
          'mri': { testName: 'MRI', testType: 'mri', cost: 500 },
          'ecg': { testName: 'ECG', testType: 'other', cost: 75 },
          'ultrasound': { testName: 'Ultrasound', testType: 'ultrasound', cost: 150 }
        };
        return testMap[testId] || { testName: testId, testType: 'other', cost: 0 };
      });

      const response = await api.put(`/checker/visits/${visitId}/checker`, {
        symptoms,
        labTests,
        notes
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to save assessment' };
    }
  },

  // Direct diagnosis without lab tests
  directDiagnosis: async (visitId) => {
    try {
      const response = await api.put(`/checker/visits/${visitId}/direct`, {
        symptoms: 'Direct diagnosis completed',
        diagnosis: 'Patient assessed and diagnosed without lab tests'
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to complete direct diagnosis' };
    }
  }
};
