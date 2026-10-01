import React, { useEffect, useState } from "react";
import { BookOpen, CheckCircle, Clock3, Play, Star, X, Lock } from "lucide-react";
import { getCourseDetails, getCourseVideos } from "../services/api";

export function CourseViewerModal({ course, isOpen, onClose }) {
  const [videos, setVideos] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && course) {
      setLoading(true);
      getCourseDetails(course.id)
        .then((res) => {
          if (res && res.videos) {
            setVideos(res.videos);
          } else {
            return getCourseVideos(course.id).then((vids) => setVideos(vids));
          }
        })
        .catch((err) => {
          console.error("Error fetching course videos:", err);
          setVideos([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const activeVideo = videos[activeVideoIndex];

  // Helper function to render correct video player (YouTube/Vimeo embed vs HTML5 Video)
  const renderVideoPlayer = (video) => {
    if (!video || !video.video_url) {
      return (
        <div className="video-placeholder-empty">
          <BookOpen size={48} />
          <p>No video available for this lesson yet.</p>
        </div>
      );
    }

    const url = video.video_url;

    // Check if YouTube link
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let embedUrl = url;
      if (url.includes("watch?v=")) {
        embedUrl = url.replace("watch?v=", "embed/");
      }
      return (
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="course-video-iframe"
        />
      );
    }

    // HTML5 Video tag for local uploaded files or MP4 URLs
    return (
      <video
        src={url}
        controls
        autoPlay={false}
        className="course-video-element"
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="admin-modal-overlay">
      <div className="course-viewer-modal">
        <div className="course-viewer-header">
          <div>
            <span className={`badge-accent accent--${course.accent || "violet"}`}>
              {course.level} • {course.duration}
            </span>
            <h2>{course.title}</h2>
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="course-viewer-grid">
          {/* Main Player Column */}
          <div className="course-viewer-main">
            <div className="video-player-container">
              {loading ? (
                <div className="video-loading-state">
                  <p>Loading course content...</p>
                </div>
              ) : videos.length > 0 ? (
                renderVideoPlayer(activeVideo)
              ) : (
                <div className="video-placeholder-empty">
                  <Play size={40} />
                  <h3>No Videos Uploaded Yet</h3>
                  <p>The instructor has not added video lessons to this course yet.</p>
                </div>
              )}
            </div>

            {activeVideo && (
              <div className="active-video-details">
                <span className="video-sequence-pill">Lesson {activeVideoIndex + 1} of {videos.length}</span>
                <h3>{activeVideo.title}</h3>
                {activeVideo.description && <p>{activeVideo.description}</p>}
              </div>
            )}
          </div>

          {/* Sidebar Playlist Column */}
          <div className="course-viewer-sidebar">
            <div className="playlist-header">
              <h3>Course Syllabus & Videos</h3>
              <small>{videos.length} Lessons Available</small>
            </div>

            <div className="playlist-items">
              {loading ? (
                <p className="playlist-loading">Loading lessons...</p>
              ) : videos.length === 0 ? (
                <p className="playlist-empty">No videos in playlist.</p>
              ) : (
                videos.map((vid, idx) => {
                  const isActive = idx === activeVideoIndex;
                  return (
                    <button
                      key={vid.id}
                      className={`playlist-item ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveVideoIndex(idx)}
                      type="button"
                    >
                      <span className="playlist-item__icon">
                        {isActive ? <Play size={14} fill="currentColor" /> : idx + 1}
                      </span>
                      <div className="playlist-item__info">
                        <strong>{vid.title}</strong>
                        {vid.description && <small>{vid.description.slice(0, 50)}...</small>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
