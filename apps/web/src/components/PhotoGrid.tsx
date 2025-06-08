import React, { useState, useEffect } from 'react';
import { Photo } from '../types';
import PhotoCard from './PhotoCard';
import { useAuth } from '../contexts/AuthContext';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  const { user } = useAuth();
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    // Extract unique users from photos
    const uniqueUsers = Array.from(
      new Set(photos.map(photo => photo.user.id))
    ).map(userId => {
      const photo = photos.find(p => p.user.id === userId);
      return {
        id: userId,
        name: photo?.user.name || photo?.user.email || `User ${userId}`
      };
    });
    setUsers(uniqueUsers);
  }, [photos]);

  useEffect(() => {
    if (selectedUser === null) {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(photo => photo.user.id === selectedUser));
    }
  }, [selectedUser, photos]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="userFilter" className="text-sm font-medium text-gray-700">
          Filter by user:
        </label>
        <select
          id="userFilter"
          value={selectedUser || ''}
          onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : null)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">All users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo)}
          />
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid; 