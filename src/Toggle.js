import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useState } from "react";

function Toggle({ values, callback, label, initialState }) {
    const [value, setValue] = useState(initialState)

    return <div style={{display: "flex"}}>
        <span>{label}</span>
        <div className="toggle" data-value={value} onClick={(e) => {
            const newValueIndex = (value + 1) % 2;
            setValue(newValueIndex)
            callback(values[newValueIndex])
        }}>
            <FontAwesomeIcon icon={faXmark} />
            <FontAwesomeIcon icon={faCheck}/>
        </div>
    </div>
}

export default Toggle;