'use client';

import { useState, useEffect } from 'react';
import { getReadingStatus, setReadingStatus, removeReadingStatus, ReadingStatus } from '@/lib/api';

interface ReadingStatusSelectorProps {
  malId: number;
  onStatusChange?: () => void;
}

const STATUS_OPTIONS: { value: ReadingStatus; label: string; color: string }[] = [
  { value: 'plan_to_read', label: 'Plan to Read', color: 'bg-blue-600' },
  { value: 'reading', label: 'Reading', color: 'bg-green-600' },
  { value: 'completed', label: 'Completed', color: 'bg-purple-600' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-600' },
  { value: 'dropped', label: 'Dropped', color: 'bg-red-600' },
];

export default function ReadingStatusSelector({ malId, onStatusChange }: ReadingStatusSelectorProps) {
  const [currentStatus, setCurrentStatus] = useState<ReadingStatus>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [malId]);

  const fetchStatus = async () => {
    try {
      const data = await getReadingStatus(malId);
      setCurrentStatus(data.status);
    } catch (err) {
      console.error('Failed to fetch reading status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: ReadingStatus) => {
    if (saving) return;
    
    setSaving(true);
    try {
      if (status === null) {
        // Remove status
        await removeReadingStatus(malId);
        setCurrentStatus(null);
      } else {
        // Set new status
        await setReadingStatus(malId, status);
        setCurrentStatus(status);
      }
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update reading status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="border-2 border-black rounded-lg p-4">
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black rounded-lg p-4">
      <h3 className="text-lg font-bold mb-3">Reading Status</h3>
      <div className="space-y-2">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = currentStatus === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleStatusChange(isSelected ? null : option.value)}
              disabled={saving}
              className={`w-full px-4 py-2 text-left rounded-lg border-2 transition-colors ${
                isSelected
                  ? `${option.color} text-white border-black font-semibold`
                  : 'bg-white text-black border-black hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              {option.label}
              {isSelected && ' ✓'}
            </button>
          );
        })}
        {currentStatus && (
          <button
            onClick={() => handleStatusChange(null)}
            disabled={saving}
            className="w-full px-4 py-2 text-left rounded-lg border-2 border-black bg-white text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Remove Status
          </button>
        )}
      </div>
    </div>
  );
}

