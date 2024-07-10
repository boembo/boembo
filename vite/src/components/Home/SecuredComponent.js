
// src/components/SecuredData.js
import React, { useEffect, useState } from 'react';
import useAxios from '../api/axios';

const SecuredData = () => {
  const axios = useAxios();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching secured data:', error);
      }
    };

    fetchData();
  }, [axios]);

  return (
    <div>
      <h2>Secured Data</h2>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
    </div>
  );
};

export default SecuredData;
