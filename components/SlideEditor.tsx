import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';
import { X, Plus, Trash, Image as ImageIcon, Upload } from 'lucide-react';

interface SlideEditorProps {
  slide: Slide;
  isOpen: boolean;
  onSave: (updatedSlide: Slide) => void;
  onClose: () => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ slide, isOpen, onSave, onClose }) => {
  const [title, setTitle] = useState(slide.title);
  const [bullets, setBullets] = useState(slide.bullets);
  const [notes, setNotes] = useState(slide.speakerNotes || '');
  const [image, setImage] = useState<string | undefined>(slide.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when slide changes
  useEffect(() => {
    setTitle(slide.title);
    setBullets(slide.bullets);
    setNotes(slide.speakerNotes || '');
    setImage(slide.image);
  }, [slide]);

  if (!isOpen) return null;

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const addBullet = () => {
    setBullets([...bullets, '']);
  };

  const removeBullet = (index: number) => {
    const newBullets = bullets.filter((_, i) => i !== index);
    setBullets(newBullets);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave({
      ...slide,
      title,
      bullets: bullets.filter(b => b.trim() !== ''), // Remove empty bullets
      speakerNotes: notes,
      image: image,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Edit Slide</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Text Content */}
          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Slide Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Enter slide title"
              />
            </div>

            {/* Bullets Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bullet Points</label>
              <div className="space-y-3">
                {bullets.map((bullet, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(index, e.target.value)}
                      className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                    />
                    <button
                      onClick={() => removeBullet(index)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addBullet}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2"
                >
                  <Plus size={16} /> Add Bullet Point
                </button>
              </div>
            </div>

            {/* Speaker Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Speaker Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-sm"
                placeholder="Add notes for the presenter..."
              />
            </div>
          </div>

          {/* Right Column: Image & Preview */}
          <div className="space-y-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Slide Image</label>
            
            <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] transition-all ${image ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
              {image ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                  <img 
                    src={image} 
                    alt="Slide Visual" 
                    className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
                     <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-indigo-600"
                      title="Change Image"
                    >
                      <Upload size={20} />
                    </button>
                    <button
                      onClick={removeImage}
                      className="bg-white/90 p-2 rounded-full text-slate-700 hover:text-red-600"
                      title="Remove Image"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors w-full h-full justify-center"
                >
                  <div className="p-4 bg-white rounded-full shadow-sm mb-3">
                    <ImageIcon size={32} />
                  </div>
                  <span className="font-medium">Click to upload an image</span>
                  <span className="text-xs mt-1 text-slate-400">Supports JPG, PNG</span>
                </button>
              )}
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
               <p className="flex items-start gap-2">
                 <span className="font-bold">Tip:</span> 
                 Images will be placed on the right side of the slide, with bullet points on the left.
               </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all transform active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};