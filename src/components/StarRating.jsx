/**
 * Star Rating কম্পোনেন্ট
 *
 * দুই ভাবে ব্যবহার করা যায়:
 * 1. দেখানোর জন্য:  <StarRating value={4.5} readOnly />
 * 2. রেটিং দেওয়ার জন্য: <StarRating value={rating} onChange={setRating} />
 */
export default function StarRating({
    value = 0,
    onChange,
    readOnly = false,
    size = '1.2rem'
}) {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (star) => {
        if (readOnly || !onChange) return;
        onChange(star);
    };

    return (
        <div
            className="star-rating"
            style={{
                display: 'inline-flex',
                gap: '2px',
                fontSize: size,
                cursor: readOnly ? 'default' : 'pointer',
                userSelect: 'none'
            }}
            aria-label={`রেটিং ${value} / ৫`}
        >
            {stars.map((star) => {
                const filled = star <= Math.round(value);
                return (
                    <span
                        key={star}
                        onClick={() => handleClick(star)}
                        style={{
                            color: filled ? '#ff9800' : '#ddd',
                            transition: '0.15s',
                            lineHeight: 1
                        }}
                        title={
                            readOnly
                                ? `${star} তারা`
                                : `${star} তারা দিন`
                        }
                    >
                        {filled ? '★' : '☆'}
                    </span>
                );
            })}
        </div>
    );
}