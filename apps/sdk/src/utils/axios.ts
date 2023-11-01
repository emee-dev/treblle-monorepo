import axios, { AxiosError, AxiosResponse } from 'axios';
import { TreblleRequestError } from './error';
import { Options } from './treblle';
import { RoundRobinBalancer } from './utils';

// Define the payload structure expected by axiosRequest
interface AxiosPayload {
  endpoint: string;
  API_KEY: string;
  payload: Record<string, unknown>;
  logError: boolean;
}

// Define the properties required to send a payload to Treblle
interface SendPayloadProp {
  API_KEY: string;
  trebllePayload: Record<string, unknown>;
  options: Options;
  treblleBaseUrls: string[];
}

// Function to make an Axios request
export const axiosRequest = async ({ endpoint, API_KEY, payload, logError }: AxiosPayload) => {
  try {
    // Make the axios post request
    const response: AxiosResponse = await axios.post(endpoint, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
    });

    // Check if the request status is not OK
    if (response.status !== 200) {
      throw new TreblleRequestError('Request was not OK', response.status);
    }

    // Extract the response data
    const responseData = await response.data;

    // Check if the status code is in the response is not true
    if (!responseData.status) {
      throw new TreblleRequestError(responseData.message ?? 'No response message', responseData.status ?? 'No response status');
    }

    // Uncomment the following block if you want to log success messages
    if (logError) {
      console.log(`[TREBLLE_REQUEST_SUCCESS]:`, responseData);
    }
  } catch (error) {
    // Handle errors and log them
    if (logError) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error(`[AXIOS_ERROR]: ${axiosError.message}`);
      } else if (error instanceof TreblleRequestError) {
        console.error(error);
      } else {
        console.error(`[UNHANDLED_ERROR]:`, error);
      }
    }
  }
};

// Function to send payload to Treblle based on environment
export const sendPayloadToTreblle = async ({
  API_KEY,
  options: { logError, debugEndpoints, environment },
  trebllePayload,
  treblleBaseUrls,
}: SendPayloadProp) => {
  if (environment === 'production' && debugEndpoints.length > 0) {
    if (logError) {
      console.log('[TREBLLE] Debug endpoints are not allowed in production');
    }
  }

  /** Set the treblleBaseUrls if in production environment */
  if (environment === 'production' && debugEndpoints.length === 0) {
    const roundRobinInstance = new RoundRobinBalancer(treblleBaseUrls);
    let url = await roundRobinInstance.getTreblleBaseUrl();

    await axiosRequest({ endpoint: url, API_KEY, payload: trebllePayload, logError: logError });
    return;
  }

  /** Set the debugEndpoint to roundRobinBalancer if in testing environment and debugEndpoints are provided */
  if (environment === 'testing' && debugEndpoints.length > 0) {
    const roundRobinInstance = new RoundRobinBalancer(debugEndpoints);
    let url = await roundRobinInstance.getTreblleBaseUrl();

    /** Send Treblle Payload in testing environment and no API_KEY */
    await axiosRequest({ endpoint: url, API_KEY, payload: trebllePayload, logError: logError });
    return;
  }

  // Add additional conditions for other environments if needed
};
