const VideoBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* YouTube Video Background */}
      <iframe
        className="absolute inset-0 w-full h-full object-cover"
        src="https://www.youtube.com/embed/ZjVAsJOl8SM?autoplay=1&mute=1&loop=1&playlist=ZjVAsJOl8SM&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
        title="Travel Background Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ 
          transform: 'scale(1.2)',
          transformOrigin: 'center center'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
    </div>
  );
};

export default VideoBackground;