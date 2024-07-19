import { useDispatch, useSelector } from 'react-redux';
import { addWidget, updateLayout, updateWidgetSetting, fetchWidgetSettings } from './layoutSlice';

export default function TotalTaskWidget( { id }) {

const widgetSetting = useSelector((state) => state.layout.widgetSettings);
const settings = widgetSetting[id];

console.log('Team Widget render');
console.log(settings);

    return (
            <div>
                <h1>team task widget</h1>
                {settings.showTitle.value && <h2>showing title</h2>}
            </div>
            );
}
