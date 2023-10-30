import "./RatingRange.css";

const MIN_RATING = 47;
const MAX_RATING = 99;

function RatingRange({ minRating, maxRating, setMinRating, setMaxRating }) {
    return <div className="rating-range">
        <span>Rating</span>
        <div className="slider-wrapper">
            <span>{minRating}</span>
            <div className="slider-area">
                <div className="track-gold"></div>
                <div className="track-silver"></div>
                <div className="track-bronze"></div>
                <input id="min-rating-range" defaultValue={minRating} min={MIN_RATING} max={MAX_RATING} type="range" onChange={e => {
                    const rating = e.target.value;
                    setMinRating(rating);
                    if (rating > maxRating) {
                        setMaxRating(rating);
                        document.getElementById("max-rating-range").value = rating;
                    }
                }} />
                <input id="max-rating-range" defaultValue={maxRating} min={MIN_RATING} max={MAX_RATING} type="range" onChange={e => {
                    const rating = e.target.value;
                    setMaxRating(rating);
                    if (rating < minRating) {
                        setMinRating(rating);
                        document.getElementById("min-rating-range").value = rating;
                    }
                }} />
            </div>
            <span>{maxRating}</span>
        </div>
    </div>
}

export default RatingRange;