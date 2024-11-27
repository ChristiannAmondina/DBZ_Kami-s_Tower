import { h, render } from 'preact';
import { useEffect } from 'preact/hooks';
import './assets/styles.css';

function App() {
  useEffect(() => {
    setTimeout(() => {
      const image = document.querySelector('.image6');
      if (image) {
        image.style.animationPlayState = 'running'; // Start animation
        image.style.opacity = 1;                   // Make it visible
      }
    }, 13000);
  }, []);

  return (
    <div>
      <div className="image1">
        <img src="/images/Websiteview/Namelogo.png" alt="Kami's Lookout Logo" />
      </div>
      <div className="image2">
        <img src="/images/Websiteview/goku.png" alt="Kami's Lookout Logo" />
      </div>
      <div className="image3">
        <img src="/images/Websiteview/Kami.webp" alt="Kami's Lookout Logo" />
      </div>
      <div className="image4">
        <img src="/images/Websiteview/mrpopo.webp" alt="Kami's Lookout Logo" />
      </div>
      <div className="image5">
        <img src="/images/Websiteview/note.png" alt="Kami's Lookout Logo" />
      </div>
      <div className="image6">
        <img src="/images/Websiteview/note1.png" alt="Kami's Lookout Logo" />
      </div>
      <div className="youtube-audio">
        <iframe
          width="0"
          height="0"
          src="https://www.youtube.com/embed/3ceZRcNDgbY?autoplay=1&loop=1&playlist=3ceZRcNDgbY"
          frameBorder="0"
          allow="autoplay"
        ></iframe>
      </div>
    </div>
  );
}

render(<App />, document.getElementById('app'));
