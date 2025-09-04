// File: InputArea.js

import React, { useState, useRef, useEffect } from 'react';
import LiveWaveform from "./LiveWaveform";
import { IoMicOutline } from "react-icons/io5";
import { CgAttachment } from 'react-icons/cg';
import { MdSend } from 'react-icons/md';
import { IoMdClose, IoMdCheckmark } from "react-icons/io"; // For X and ✓
import { FaSpinner } from 'react-icons/fa';
import './styles/InputArea.css';
import config from '../config';
import MicRecorder from 'mic-recorder-to-mp3';
 
 
function InputArea({
  input,
  handleInputChange,
  handleSubmit,
  handleFileChange,
  //disableInput = false
  disableSendButton = false,
  disableMicAndTyping = false,
  isGenerating = false,                  // 👈 add this
  handleStopGenerating = () => {} 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const inputRef = useRef(null);
  const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const shouldTranscribeRef = useRef(true);
 
  const autoGrow = () => {
    const input = inputRef.current;
    if (input) {
      input.style.height = "auto"; // reset height
      input.style.height = input.scrollHeight + "px"; // set to scrollHeight
    }
  };
 
  useEffect(() => {
    autoGrow();
  }, [input]);

  
  useEffect(() => {
    if (!window.MediaRecorder && !window.AudioContext) {
      alert("Your browser does not support audio recording.");
    }
  }, []);

 
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMediaStream(stream);

      if (isSafari) {
        await recorderRef.current.start(); // (optionally pass stream here)
        // waveform now works: stream is set
      } else {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
      }

      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access is required to record audio.');
    }
  };



  const stopRecording = async () => {
    if (isSafari) {
      try {
        const [buffer, blob] = await recorderRef.current.stop().getMp3();
        setIsRecording(false);
        setIsProcessing(shouldTranscribeRef.current);
        if (shouldTranscribeRef.current) {
          await transcribeAudio(blob);
        }
        setIsProcessing(false);
        stopMicrophoneStream();
      } catch (error) {
        console.error("Error stopping recorder:", error);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        const transcribeOnStop = shouldTranscribeRef.current;
        mediaRecorderRef.current.onstop = async () => {
          setIsRecording(false);
          setIsProcessing(transcribeOnStop);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (transcribeOnStop) {
            await transcribeAudio(audioBlob);
          }
          setIsProcessing(false);
          stopMicrophoneStream();
        };
        mediaRecorderRef.current.stop();
      }
    }
  };


 
  const stopMicrophoneStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setMediaStream(null);
    }
  };
 
  // const transcribeAudio = async (audioBlob) => {
  //   const formData = new FormData();

  //   if (isSafari) {
  //     formData.append('file', audioBlob, 'recording.mp3');
  //   } else {
  //     formData.append('file', audioBlob, 'recording.webm');
  //   }

  //   try {
  //     const response = await fetch(`${config.API_BASE_URL}/api/transcribe`, {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       handleInputChange({ target: { value: data.transcription } });
  //     } else {
  //       console.error('Transcription failed:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error during transcription:', error);
  //   }
  // };
  
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, isSafari ? 'recording.mp3' : 'recording.webm');
  
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        const newText = (data?.transcription || "").trim();
  
        // 👇 Append to existing input instead of replacing it
        const appended = input?.trim()
          ? `${input.trim()} ${newText}`.trim()         // use a space separator
          : newText;
  
        // keep using your existing handler, but pass the combined value
        handleInputChange({ target: { value: appended } });
      } else {
        console.error('Transcription failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during transcription:', error);
    }
  };
  
  
  
 
 
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disableSendButton && !isProcessing) {
        handleSubmit();
      }
    }
  };
  



  const handleCancelRecording = () => {
    shouldTranscribeRef.current = false;
    stopRecording();
  };

  const handleConfirmRecording = () => {
    shouldTranscribeRef.current = true;
    stopRecording();
  };


   
return (
  <div className="input-area">
    <div className="chat-input-container">
      {isRecording || isProcessing ? (
        <div className="recording-bar">
          {/* If processing, show spinner centered */}
          {isProcessing ? (
            <div className="processing-spinner-container">
              <FaSpinner className="spinner-icon" />
            </div>
          ) : (
            <>
              <div className="waveform-container">
                {mediaStream && <LiveWaveform stream={mediaStream} width={380} height={44} />}
              </div>
              <div className="recording-actions">
                <button className="recording-cancel" onClick={handleCancelRecording} title="Cancel">
                  <IoMdClose size={28} />
                </button>
                <button className="recording-confirm" onClick={handleConfirmRecording} title="Confirm">
                  <IoMdCheckmark size={28} />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <button className="attachment-button" disabled={disableSendButton || isProcessing}>
            <label htmlFor="file-upload">
              <CgAttachment size={18} />
            </label>
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={disableSendButton || isProcessing}
            />
          </button>
 
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              handleInputChange(e);
              autoGrow();
            }}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything..."
            rows="1"
            className="chat-input"
            disabled={disableMicAndTyping || isProcessing}
          />
 
          <div className="chat-right-buttons">
  {!isGenerating ? (
    <button
      className="send-button"
      onClick={handleSubmit}
      disabled={disableSendButton || isProcessing}
    >
      <MdSend size={20} />
    </button>
  ) : (
    <button
      className="stop-button"
      onClick={handleStopGenerating}
      title="Stop Generating"
    >
      <div className="stop-icon" />
    </button>
  )}

 
          <button
            className={`mic-button`}
            onClick={startRecording}
            disabled={disableMicAndTyping}
          >
            <IoMicOutline size={25} />
          </button>
        </div>
        </>
      )}
    </div>
  </div>
);
 
 
 
 
}
 
export default InputArea;

