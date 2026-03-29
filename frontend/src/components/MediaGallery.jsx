import React, { useState, useEffect } from 'react';
import { X, Image, Mic, Download, Loader2, Play } from 'lucide-react';
import { ChatStore } from '../store/ChatStore';
import { formatedMessageTime } from '../lib/utils';

const MediaGallery = ({ isOpen, onClose, userId }) => {
    const [activeTab, setActiveTab] = useState('images');
    const [selectedImage, setSelectedImage] = useState(null);

    const { getMediaGallery, mediaGallery, isGalleryLoading } = ChatStore();

    useEffect(() => {
        if (isOpen && userId) {
            getMediaGallery(userId);
        }
    }, [isOpen, userId, getMediaGallery]);

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
            <div className="bg-base-100 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-300">
                    <h3 className="font-bold text-lg">Media Gallery</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-base-300">
                    <button
                        onClick={() => setActiveTab('images')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors
                            ${activeTab === 'images'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-base-content/60 hover:bg-base-200'
                            }`}
                    >
                        <Image className="size-4" />
                        Photos
                        {mediaGallery?.images?.length > 0 && (
                            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                                {mediaGallery.images.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 transition-colors
                            ${activeTab === 'voice'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-base-content/60 hover:bg-base-200'
                            }`}
                    >
                        <Mic className="size-4" />
                        Voice Messages
                        {mediaGallery?.voiceNotes?.length > 0 && (
                            <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                                {mediaGallery.voiceNotes.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 overflow-y-auto flex-1 min-h-0">
                    {isGalleryLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="size-8 animate-spin text-primary" />
                        </div>
                    ) : activeTab === 'images' ? (
                        <ImagesGrid
                            images={mediaGallery?.images || []}
                            onSelect={setSelectedImage}
                            onDownload={handleDownload}
                        />
                    ) : (
                        <VoiceList
                            voices={mediaGallery?.voiceNotes || []}
                            onDownload={handleDownload}
                        />
                    )}
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <ImageLightbox
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onDownload={handleDownload}
                />
            )}
        </div>
    );
};

// Images Grid Component
const ImagesGrid = ({ images, onSelect, onDownload }) => {
    if (images.length === 0) {
        return (
            <div className="text-center py-16 text-base-content/50">
                <Image className="size-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No photos shared yet</p>
            </div>
        );
    }

    // Group by month
    const groupedImages = images.reduce((acc, img) => {
        const date = new Date(img.createdAt);
        const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(img);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {Object.entries(groupedImages).map(([month, monthImages]) => (
                <div key={month}>
                    <h4 className="text-sm font-semibold text-base-content/60 mb-3">{month}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {monthImages.map((img, idx) => (
                            <button
                                key={img._id || idx}
                                onClick={() => onSelect(img)}
                                className="relative aspect-square rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all"
                            >
                                <img
                                    src={img.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDownload(img.image, `photo-${idx}.jpg`);
                                        }}
                                        className="p-2 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <Download className="size-4 text-base-content" />
                                    </button>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Voice Messages List
const VoiceList = ({ voices, onDownload }) => {
    const [playingId, setPlayingId] = useState(null);

    if (voices.length === 0) {
        return (
            <div className="text-center py-16 text-base-content/50">
                <Mic className="size-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No voice messages yet</p>
            </div>
        );
    }

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-2">
            {voices.map((voice, idx) => (
                <div
                    key={voice._id || idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-base-200 hover:bg-base-300 transition-colors"
                >
                    <button
                        onClick={() => {
                            // Toggle play
                            setPlayingId(playingId === voice._id ? null : voice._id);
                        }}
                        className="p-3 rounded-full bg-primary text-primary-content"
                    >
                        <Play className="size-5" />
                    </button>

                    <div className="flex-1">
                        <div className="flex items-center gap-1 h-8">
                            {(voice.voiceNote?.waveform || Array(30).fill(0.5)).map((h, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-primary/40 rounded-full"
                                    style={{ height: `${Math.max(4, h * 32)}px` }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-base-content/60 mt-1">
                            <span>{voice.senderId?.fullname}</span>
                            <span>{formatDuration(voice.voiceNote?.duration || 0)}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-base-content/50">
                            {formatedMessageTime(voice.createdAt)}
                        </p>
                        <button
                            onClick={() => onDownload(voice.voiceNote?.url, `voice-${idx}.webm`)}
                            className="p-2 rounded-full hover:bg-base-content/10 transition-colors"
                        >
                            <Download className="size-4 text-base-content/50" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Image Lightbox
const ImageLightbox = ({ image, onClose, onDownload }) => {
    return (
        <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60]"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white"
            >
                <X className="size-6" />
            </button>

            <img
                src={image.image}
                alt=""
                className="max-w-[90vw] max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <p className="text-white/60 text-sm">
                    {formatedMessageTime(image.createdAt)} • {image.senderId?.fullname}
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownload(image.image, 'photo.jpg');
                    }}
                    className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                    <Download className="size-5" />
                </button>
            </div>
        </div>
    );
};

export default MediaGallery;
