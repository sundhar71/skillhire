import { useState } from 'react';
const useExam = () => {
  const [exam, setExam] = useState(null);
  return { exam, setExam };
};
export default useExam; 