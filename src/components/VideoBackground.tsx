const VideoBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background */}
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source 
          src="https://videos.pexels.com/video-files/2169880/2169880-uhd_3840_2160_25fps.mp4" 
          type="video/mp4" 
        />
        {/* Fallback for browsers that don't support video */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=3945&q=80)`
          }}
        />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
    </div>
  );
};

export default VideoBackground;