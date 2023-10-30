import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons'

const MAX_UI_SCALE = 12;
const MIN_UI_SCALE = 1;

const UI_SCALE_STEP = 0.5;

function increaseUiScale(uiScale, setUiScale) {
    if (uiScale + UI_SCALE_STEP <= MAX_UI_SCALE) {
        setUiScale(uiScale + UI_SCALE_STEP);
    }
}

function decreaseUiScale(uiScale, setUiScale) {
    if (uiScale - UI_SCALE_STEP >= MIN_UI_SCALE) {
        setUiScale(uiScale - UI_SCALE_STEP);
    }
}

function UiScaleControl({ uiScale, setUiScale }) {
    return <>
        <div className="ui-scale-control">
            <div onClick={(e) => decreaseUiScale(uiScale, setUiScale)}><FontAwesomeIcon icon={faMagnifyingGlassMinus}/></div>
            <div onClick={(e) => increaseUiScale(uiScale, setUiScale)}><FontAwesomeIcon icon={faMagnifyingGlassPlus}/></div>            
        </div>
    </>
}

export default UiScaleControl;