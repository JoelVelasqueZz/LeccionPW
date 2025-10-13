const axios = require('axios');
const config = require('../config/config');
const { logInfo, logWarning } = require('../middlewares/logger');

/**
 * Servicio HTTP para comunicación con microservicios
 */
class HttpService {
  constructor() {
    this.axiosInstance = axios.create({
      timeout: config.requestTimeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Realiza una petición GET a un microservicio
   * @param {string} serviceUrl - URL del microservicio
   * @param {string} endpoint - Endpoint específico
   * @param {object} params - Parámetros de consulta
   */
  async get(serviceUrl, endpoint = '', params = {}) {
    try {
      const url = `${serviceUrl}${endpoint}`;
      logInfo(`GET ${url}`, params);
      
      const response = await this.axiosInstance.get(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'GET', serviceUrl + endpoint);
      throw error;
    }
  }

  /**
   * Realiza una petición POST a un microservicio
   * @param {string} serviceUrl - URL del microservicio
   * @param {string} endpoint - Endpoint específico
   * @param {object} data - Datos a enviar
   */
  async post(serviceUrl, endpoint = '', data = {}) {
    try {
      const url = `${serviceUrl}${endpoint}`;
      logInfo(`POST ${url}`, data);
      
      const response = await this.axiosInstance.post(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'POST', serviceUrl + endpoint);
      throw error;
    }
  }

  /**
   * Realiza una petición PUT a un microservicio
   * @param {string} serviceUrl - URL del microservicio
   * @param {string} endpoint - Endpoint específico
   * @param {object} data - Datos a actualizar
   */
  async put(serviceUrl, endpoint = '', data = {}) {
    try {
      const url = `${serviceUrl}${endpoint}`;
      logInfo(`PUT ${url}`, data);
      
      const response = await this.axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'PUT', serviceUrl + endpoint);
      throw error;
    }
  }

  /**
   * Realiza una petición DELETE a un microservicio
   * @param {string} serviceUrl - URL del microservicio
   * @param {string} endpoint - Endpoint específico
   */
  async delete(serviceUrl, endpoint = '') {
    try {
      const url = `${serviceUrl}${endpoint}`;
      logInfo(`DELETE ${url}`);
      
      const response = await this.axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      this.handleError(error, 'DELETE', serviceUrl + endpoint);
      throw error;
    }
  }

  /**
   * Maneja errores de las peticiones HTTP
   */
  handleError(error, method, url) {
    if (error.code === 'ECONNREFUSED') {
      logWarning(`Servicio no disponible: ${method} ${url}`);
    } else if (error.code === 'ECONNABORTED') {
      logWarning(`Timeout en petición: ${method} ${url}`);
    } else if (error.response) {
      logWarning(`Error ${error.response.status}: ${method} ${url}`);
    }
  }

  /**
   * Verifica el estado de un microservicio
   * @param {string} serviceUrl - URL del microservicio
   */
  async healthCheck(serviceUrl) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, {
        timeout: 2000
      });
      return {
        available: true,
        status: response.data
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

module.exports = new HttpService();