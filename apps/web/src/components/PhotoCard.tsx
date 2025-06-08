import React from 'react';
import { Photo } from '../types';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  return (
    <div
      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={onClick}
    >
      <img
        src={photo.gcsUrl || `/api/photos/${photo.filename}`}
        alt={photo.originalName}
        className="w-full h-48 object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-sm font-medium truncate">{photo.originalName}</h3>
          {photo.description && (
            <p className="text-xs mt-1 truncate">{photo.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {photo.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-20"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs">
            <p>Uploaded by: {photo.user.name || photo.user.email}</p>
            <p className="text-gray-300">
              {new Date(photo.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard; 