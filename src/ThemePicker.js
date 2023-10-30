import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'

function swapTheme(currentTheme) {
    return currentTheme == "Dark" ? "Light" : "Dark";
}
function ThemePicker({ currentTheme, setTheme }) {
    return <>
        <div className={"theme-picker " + currentTheme} data-theme={currentTheme} onClick={(e) => setTheme(swapTheme(currentTheme))}>
            <FontAwesomeIcon icon={faMoon}/>
            <FontAwesomeIcon icon={faSun} />
        </div>
    </>
}

export default ThemePicker;