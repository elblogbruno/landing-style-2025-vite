import './LoadingBox.css'; // Import the CSS file

const LoadingBox = () => {
  return (
    <div className="loading-container">
      <div className="box">
        <div className="lid"></div>
        <div className="base"></div>
      </div>
    </div>
  );
};

export default LoadingBox;
