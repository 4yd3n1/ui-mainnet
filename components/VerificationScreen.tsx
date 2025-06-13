'use client';

import React, { useState, useEffect } from 'react';
import { DEPLOYMENT_INFO } from '@/contracts/mega';

interface VerificationScreenProps {
  timeRemaining: number; // seconds until game starts
}

export default function VerificationScreen({ timeRemaining }: VerificationScreenProps) {
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayTime(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const etherscanUrl = `https://etherscan.io/address/${DEPLOYMENT_INFO.address}`;
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto w-full">
        {/* Main Container */}
        <div className="bg-gray-900/90 rounded-3xl p-8 md:p-12 backdrop-blur-xl border border-gray-800">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="neon-text-yellow">MEGA</span>
            </h1>
            <p className="text-xl text-gray-400">Preparation Period</p>
          </div>
          
          {/* Countdown Timer */}
          <div className="mb-12">
            <div className="text-center">
              <p className="text-gray-400 mb-4 text-lg">Game starts in</p>
              <div className="text-7xl md:text-8xl font-mono font-bold neon-text-yellow tracking-wider">
                {formatTime(displayTime)}
              </div>
            </div>
          </div>
          
          {/* Contract Info Box */}
          <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Contract Verification</h3>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                ✅ Verified
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm">Contract Address</p>
                <p className="text-white font-mono text-sm md:text-base break-all">
                  {DEPLOYMENT_INFO.address}
                </p>
              </div>
              
              <a 
                href={etherscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                📄 View Source Code on Etherscan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Game Rules Summary */}
          <div className="bg-gray-800/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Game Overview</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="neon-text-yellow text-xl">🎯</span>
                  <div>
                    <p className="text-gray-400 text-sm">Target</p>
                    <p className="text-white font-semibold">$100,000 market cap</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="neon-text-yellow text-xl">⏱️</span>
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-semibold">1 hour</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="neon-text-yellow text-xl">🎫</span>
                  <div>
                    <p className="text-gray-400 text-sm">Qualification</p>
                    <p className="text-white font-semibold">0.1 ETH minimum</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Message */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{boxShadow: '0 0 4px #ffe066'}}></div>
              <span>All trading locked during preparation period</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
} 