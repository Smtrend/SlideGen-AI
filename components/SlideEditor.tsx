
import React, { useState, useEffect, useRef } from 'react';
import { Slide, SlideTransition } from '../types';
import { X, Plus, Trash, Image as ImageIcon, Upload, Monitor, Presentation } from 'lucide-react';

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
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(slide.backgroundImage);
  const [transition, setTransition] = useState<SlideTransition>(slide.transition || SlideTransition.FADE);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when slide changes
  useEffect(() => {
    setTitle(slide.title);
    setBullets(slide.bullets);
    setNotes(slide.speakerNotes || '');
    setImage(slide.image);
    setBackgroundImage(slide.backgroundImage);
    setTransition(slide.transition || SlideTransition.FADE);
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

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
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

  const removeBackgroundImage = () => {
    setBackgroundImage(undefined);
    if (bgFileInputRef.current) {
      bgFileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onSave({
      ...slide,
      title,
      bullets: bullets.filter(b => b.trim() !== ''), // Remove empty bullets
      speakerNotes: notes,
      image: image,
      backgroundImage: backgroundImage,
      transition: transition
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
                {bullets.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                    <p className="text-sm text-slate-400 italic">No bullet points added yet. Add points to guide your presentation.</p>
                  </div>
                ) : (
                  bullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleBulletChange(index, e.target.value)}
                        className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Add a bullet point..."
                      />
                      <button
                        onClick={() => removeBullet(index)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))
                )}
                <button
                  onClick={addBullet}
                  className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2 group"
                >
                  <div className="bg-indigo-50 p-1 rounded-md group-hover:bg-indigo-100 transition-colors">
                    <Plus size={16} />
                  </div>
                  Add Bullet Point
                </button>
              </div>
            </div>

            {/* Speaker Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Speaker Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={8}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed"
                placeholder="Add comprehensive notes for the presenter..."
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                These notes will be exported to PowerPoint.
              </p>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="space-y-6">
            
            {/* Transition Selector */}
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Presentation size={18} className="text-emerald-500" />
                Slide Transition
              </label>
              <select
                value={transition}
                onChange={(e) => setTransition(e.target.value as SlideTransition)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value={SlideTransition.NONE}>None</option>
                <option value={SlideTransition.FADE}>Fade</option>
                <option value={SlideTransition.PUSH}>Push</option>
                <option value={SlideTransition.WIPE}>Wipe</option>
                <option value={SlideTransition.COVER}>Cover</option>
                <option value={SlideTransition.UNCOVER}>Uncover</option>
              </select>
               <p className="text-xs text-slate-400 mt-2">
                Animation effect when entering this slide.
              </p>
            </div>

            {/* Content Image Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <ImageIcon size={18} className="text-indigo-500" />
                Slide Content Image
              </label>
              
              {image ? (
                <div className="relative group">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <img src={image} alt="Slide content" className="w-full h-full object-contain" />
                  </div>
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="Remove Image"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video w-full border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                >
                  <Upload size={32} className="text-slate-400 group-hover:text-indigo-500 mb-2" />
                  <span className="text-sm text-slate-500 group-hover:text-indigo-600 font-medium">Upload Image</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-slate-400 mt-2">
                This image appears alongside your bullet points.
              </p>
            </div>

            {/* Background Image Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Monitor size={18} className="text-violet-500" />
                Slide Background
              </label>
              
              {backgroundImage ? (
                <div className="relative group">
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                    <img src={backgroundImage} alt="Slide background" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={removeBackgroundImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="Remove Background"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => bgFileInputRef.current?.click()}
                  className="aspect-video w-full border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all group"
                >
                  <Upload size={32} className="text-slate-400 group-hover:text-violet-500 mb-2" />
                  <span className="text-sm text-slate-500 group-hover:text-violet-600 font-medium">Set Background</span>
                </div>
              )}
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
              <p className="text-xs text-slate-400 mt-2">
                This image will cover the entire slide background.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
