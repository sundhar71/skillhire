import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';

export const useProctoring = ({ examId, onViolation }) => {
  const [webcamStream, setWebcamStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [violations, setViolations] = useState([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const webcamRef = useRef(null);
  const screenRef = useRef(null);
  const modelRef = useRef(null);

  // Initialize TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Load a pre-trained face detection model
        const model = await tf.loadLayersModel('/models/face_detection_model.json');
        modelRef.current = model;
      } catch (error) {
        console.log('TensorFlow model not available, using fallback');
        modelRef.current = null;
      }
    };
    loadModel();
  }, []);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      setWebcamStream(stream);
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          cursor: 'always' 
        },
        audio: false 
      });
      setScreenStream(stream);
      if (screenRef.current) {
        screenRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing screen:', error);
    }
  }, []);

  // Stop all streams
  const stopStreams = useCallback(() => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
  }, [webcamStream, screenStream]);

  // Detect face using TensorFlow.js
  const detectFace = useCallback(async (canvas) => {
    if (!modelRef.current) {
      // Fallback: mock detection
      return Math.random() > 0.8; // 20% chance of violation
    }

    try {
      const tensor = tf.browser.fromPixels(canvas);
      const resized = tf.image.resizeBilinear(tensor, [224, 224]);
      const normalized = resized.div(255.0);
      const batched = normalized.expandDims(0);
      
      const prediction = await modelRef.current.predict(batched).data();
      return prediction[0] > 0.5; // Face detected
    } catch (error) {
      console.error('Face detection error:', error);
      return false;
    }
  }, []);

  // Capture screenshot and detect violations
  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current) return;

    const canvas = document.createElement('canvas');
    const video = webcamRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const screenshot = canvas.toDataURL('image/jpeg');
    
    // Face detection
    const faceDetected = await detectFace(canvas);
    if (!faceDetected) {
      const violation = {
        type: 'face',
        timestamp: new Date(),
        screenshot
      };
      setViolations(prev => [...prev, violation]);
      onViolation?.(violation);
      
      // Send to backend
      try {
        await axios.post(`/api/exam/${examId}/proctor`, {
          webcamStream: screenshot,
          violationType: 'face',
          screenshot
        });
      } catch (error) {
        console.error('Error sending violation:', error);
      }
    }
  }, [examId, detectFace, onViolation]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        const newCount = tabSwitchCount + 1;
        setTabSwitchCount(newCount);
        
        const violation = {
          type: 'tab-switch',
          timestamp: new Date(),
          count: newCount
        };
        setViolations(prev => [...prev, violation]);
        onViolation?.(violation);
        
        // Auto-block after 3 violations
        if (newCount >= 3) {
          alert('Exam terminated due to multiple tab switches!');
          stopStreams();
        }
        
        // Send to backend
        axios.post(`/api/exam/${examId}/proctor`, {
          violationType: 'tab-switch',
          count: newCount
        }).catch(error => {
          console.error('Error sending tab switch violation:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRecording, tabSwitchCount, examId, onViolation, stopStreams]);

  // Periodic analysis
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(captureAndAnalyze, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [isRecording, captureAndAnalyze]);

  // Start recording
  const startRecording = useCallback(() => {
    setIsRecording(true);
    startWebcam();
    startScreenShare();
  }, [startWebcam, startScreenShare]);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    stopStreams();
  }, [stopStreams]);

  return {
    webcamRef,
    screenRef,
    isRecording,
    violations,
    tabSwitchCount,
    startRecording,
    stopRecording,
    startWebcam,
    startScreenShare,
    stopStreams
  };
}; 