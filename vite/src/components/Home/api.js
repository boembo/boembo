// src/components/Home/api.js
import axios from 'axios';

export const fetchAllWidgetSettings = async () => {
    const response = await axios.get('/api/widgets/settings');
    return response.data;
};

export const saveWidgetSettings = async (widgetId, settings) => {
    const response = await axios.post(`/api/widgets/${widgetId}/settings`, settings);
    return response.data;
};
