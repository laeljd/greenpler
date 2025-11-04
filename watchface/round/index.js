import * as hmUI from '@zos/ui'
import { px, log, assets } from '@zos/utils'
import { getScene, SCENE_AOD, SCENE_WATCHFACE } from '@zos/app'
import { Battery, Time, TIME_HOUR_FORMAT_12 } from '@zos/sensor'
import {
  launchApp,
  getAppIdByName,
  SYSTEM_APP_CALENDAR,
  SYSTEM_APP_SETTING,
  SYSTEM_APP_COUNTDOWN,
  SYSTEM_APP_STOPWATCH,
  SYSTEM_APP_ALARM,
  SYSTEM_APP_HR,
  SYSTEM_APP_SPORT,
  SYSTEM_APP_SLEEP
} from '@zos/router'
import { getText } from '@zos/i18n'
import { getLanguage } from '@zos/settings'


try {
  (() => {

    //#region VARIABLES
    const logger = log.getLogger('greenpler-watchface')
    const img = assets('images')
    const font = assets('fonts')

    let font_file_text = ''
    let font_file_number = ''
    let text_size_config = {}

    let timerId = null;
    let useTimer = false;
    let useInterval = false;

    let normal_background_bg = ''
    let idle_background_bg = ''
    let battery = '';
    let normal_battery_icon_img_out = ''
    let normal_battery_icon_img_top = ''
    let normal_battery_icon_img_inner = ''
    let normal_battery_linear_scale = ''
    let normal_battery_current_text_font = ''
    let timeSensor = '';
    let normal_time_hour_text_font = ''
    let idle_time_hour_text_font = ''
    let normal_time_minute_text_font = ''
    let idle_time_minute_text_font = ''
    let normal_time_second_text_font = ''
    let normal_AM_PM_text_font = ''
    let idle_AM_PM_text_font = ''
    let normal_day_text_font = ''
    let normal_week_text_font = ''
    let normal_WEEK_Array = []
    let normal_AM_Text = ''
    let normal_PM_Text = ''
    let Button_calendar = ''
    let Button_battery = ''
    let Button_countdown = ''
    let Button_alarm = ''
    let Button_hr = ''
    let Button_steps = ''
    let Button_sleep = ''
    let Button_style = ''
    // Color picker dialog state (lazy-created)
    let colorDialogWidgets = [];
    let selectedTextColor = '0x00FF80'; // default
    const colorPalette = [
      Number('0x00FF7F'),
      Number('0x7FFFBF'),
      Number('0x00FFFF'),
      Number('0x7FFFFF'),
      Number('0x007FFF'),
      Number('0x7FBFFF'),
      Number('0x0000FF'),
      Number('0x7F7FFF'),
      Number('0x7F00FF'),
      Number('0xBF7FFF'),
      Number('0xFF00FF'),
      Number('0xFF7FFF'),
      Number('0xFF007F'),
      Number('0xFF7FBF'),
      Number('0xFF0000'),
      Number('0xFF7F7F'),
      Number('0xFF7F00'),
      Number('0xFFBF7F'),
      Number('0xFFFF00'),
      Number('0xFFFF7F'),
      Number('0x7FFF00'),
      Number('0xBFFF7F'),
      Number('0x00FF00'),
      Number('0x7FFF7F'),
    ];



    // 'hsl(150 100% 75%)',
    // 'hsl(180 100% 50%)',
    // 'hsl(180 100% 75%)',
    // 'hsl(210 100% 50%)',
    // 'hsl(210 100% 75%)',
    // 'hsl(240 100% 50%)',
    // 'hsl(240 100% 75%)',
    // 'hsl(270 100% 50%)',
    // 'hsl(270 100% 75%)',
    // 'hsl(300 100% 50%)',
    // 'hsl(300 100% 75%)',
    // 'hsl(330 100% 50%)',
    // 'hsl(330 100% 75%)',
    // 'hsl(0 100% 50%)',
    // 'hsl(0 100% 75%)',
    // 'hsl(30 100% 50%)',
    // 'hsl(30 100% 75%)',
    // 'hsl(60 100% 50%)',
    // 'hsl(60 100% 75%)',
    // 'hsl(90 100% 50%)',
    // 'hsl(90 100% 75%)',
    // 'hsl(120 100% 50%)',
    // 'hsl(120 100% 75%)',


    //#endregion VARIABLES

    WatchFace({
      init_view() {
        //dynamic modify start
        settingsLanguageConfig();

        //#region Normal Screen
        normal_background_bg = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(0),
          y: px(0),
          w: px(480),
          h: px(480),
          color: '0x000000',
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        //#region Battery
        normal_battery_icon_img_top = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(204),
          y: px(428),
          w: px(6),
          h: px(4),
          color: '0x00FF88',
          radius: px(2),
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        normal_battery_icon_img_out = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(200),
          y: px(431),
          w: px(14),
          h: px(22),
          color: '0x00FF88',
          radius: px(2),
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        normal_battery_icon_img_inner = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(202),
          y: px(433),
          w: px(10),
          h: px(18),
          color: '0x000000',
          radius: px(2),
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        normal_battery_linear_scale = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(201),
          y: px(453),
          w: px(12),
          h: px(0),
          color: '0x00FF88',
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        battery = new Battery();
        battery.onChange(batteryIconFillUpdate);

        normal_battery_current_text_font = hmUI.createWidget(hmUI.widget.TEXT_FONT, {
          x: px(220),
          y: px(424),
          w: px(100),
          h: px(40),
          text_size: text_size_config.normal_battery_current_text_size,
          char_space: px(-2),
          font: font_file_number,
          color: '0xFFFFFF',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,
          unit_type: 1,
          type: hmUI.data_type.BATTERY,
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        //#endregion Battery

        //#region Time
        timeSensor = new Time();
        timeSensor.onPerDay(dayUpdate);
        timeSensor.onPerMinute(minuteUpdate);
        timeSensor.onPerHourEnd(hourUpdate);
        timeSensor.onPhoneTimeSetting(updateAllFonts);


        // hour font
        normal_time_hour_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(44),
          y: px(196),
          w: px(200),
          h: px(120),
          text_size: text_size_config.normal_time_hour_text_size,
          char_space: px(-8),
          font: font_file_number,
          color: '0xFFFFFDFB',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.RIGHT,

          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        // minute font
        normal_time_minute_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(236),
          y: px(196),
          w: px(200),
          h: px(120),
          text_size: text_size_config.normal_time_minute_text_size,
          char_space: px(-8),
          font: font_file_number,
          color: '0x00FF88',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,

          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        // second font
        normal_time_second_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(400),
          y: px(190),
          w: px(60),
          h: px(60),
          text_size: text_size_config.normal_time_second_text_size,
          char_space: px(-4),
          font: font_file_number,
          color: '0x808080',
          line_space: px(0),
          align_v: hmUI.align.TOP,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,

          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        // AM PM font
        normal_AM_PM_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(402),
          y: px(232),
          w: px(100),
          h: px(100),
          text_size: text_size_config.normal_AM_PM_text_size,
          char_space: px(-2),
          font: font_file_text,
          color: '0x00FF88',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,
          // unit_type: 2,
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        //#endregion Time

        //#region Date
        normal_day_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(176),
          y: px(55),
          w: px(50),
          h: px(40),
          text_size: text_size_config.normal_day_text_size,
          char_space: px(0),
          font: font_file_number,
          color: '0x00FF88',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.RIGHT,

          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        normal_week_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(231),
          y: px(55),
          w: px(70),
          h: px(40),
          text_size: text_size_config.normal_week_text_size,
          char_space: px(0),
          font: font_file_text,
          color: '0xFFFFFF',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,
          // unit_string: SEG, TER, QUA, QUI, SEX, SAB, DOM,
          show_level: hmUI.show_level.ONLY_NORMAL,
        });
        //#endregion Date
        //#endregion Normal Screen

        //#region AOD Screen
        idle_background_bg = hmUI.createWidget(hmUI.widget.FILL_RECT, {
          x: px(0),
          y: px(0),
          w: px(480),
          h: px(480),
          color: '0xFF000000',
          show_level: hmUI.show_level.ONLY_AOD,
        });

        idle_AM_PM_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(402),
          y: px(232),
          w: px(100),
          h: px(100),
          text_size: text_size_config.idle_AM_PM_text_size,
          char_space: px(-2),
          font: font_file_text,
          color: '0x00FF88',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,

          // unit_type: 2,
          show_level: hmUI.show_level.ONLY_AOD,
        });

        idle_time_hour_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(44),
          y: px(196),
          w: px(200),
          h: px(120),
          text_size: text_size_config.idle_time_hour_text_size,
          char_space: px(-8),
          font: font_file_number,
          color: '0x484848',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.RIGHT,

          show_level: hmUI.show_level.ONLY_AOD,
        });

        idle_time_minute_text_font = hmUI.createWidget(hmUI.widget.TEXT, {
          x: px(236),
          y: px(196),
          w: px(200),
          h: px(120),
          text_size: text_size_config.idle_time_minute_text_size,
          char_space: px(-8),
          font: font_file_number,
          color: '0x00FF88',
          line_space: px(0),
          align_v: hmUI.align.CENTER_V,
          text_style: hmUI.text_style.ELLIPSIS,
          align_h: hmUI.align.LEFT,

          show_level: hmUI.show_level.ONLY_AOD,
        });
        //#endregion AOD Screen

        //#region Buttons
        Button_calendar = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(173),
          y: px(45),
          w: px(134),
          h: px(60),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          click_func: (button_widget) => {
            launchApp({
              appId: SYSTEM_APP_CALENDAR,
              native: true,
            });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_battery = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(184),
          y: px(416),
          w: px(112),
          h: px(60),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          click_func: (button_widget) => {
            launchApp({ url: 'Settings_batteryManagerScreen', native: true });
          },
          longpress_func: (button_widget) => {
            launchApp({ url: 'LowBatteryScreen', native: true });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_countdown = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(394),
          y: px(184),
          w: px(90),
          h: px(112),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          click_func: (button_widget) => {
            launchApp({
              appId: SYSTEM_APP_COUNTDOWN,
              native: true,
            });
          },
          longpress_func: (button_widget) => {
            launchApp({
              appId: SYSTEM_APP_STOPWATCH,
              native: true,
            });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_alarm = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(80),
          y: px(184),
          w: px(306),
          h: px(112),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          longpress_func: (button_widget) => {
            launchApp({
              appId: SYSTEM_APP_ALARM,
              native: true,
            });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_hr = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(40),
          y: px(40),
          w: px(100),
          h: px(100),
          radius: px(50),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          click_func: (button_widget) => {
            launchApp({
              appId: SYSTEM_APP_HR,
              native: true,
            });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_steps = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(340),
          y: px(40),
          w: px(100),
          h: px(100),
          radius: px(50),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          click_func: (button_widget) => {
            launchApp({ url: 'activityAppScreen', native: true });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_sleep = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(40),
          y: px(340),
          w: px(100),
          h: px(100),
          radius: px(50),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          click_func: (button_widget) => {
            launchApp({
              appId: SYSTEM_APP_SLEEP,
              native: true,
            });
          },
          show_level: hmUI.show_level.ONLY_NORMAL,
        });

        Button_style = hmUI.createWidget(hmUI.widget.BUTTON, {
          x: px(340),
          y: px(340),
          w: px(100),
          h: px(100),
          radius: px(50),
          press_src: img('transparent.png'),
          normal_src: img('transparent.png'),
          show_level: hmUI.show_level.ONLY_NORMAL,
          longpress_func: (button_widget) => {
            changeWatchFaceStyle();
          },
        });
        //#endregion Buttons

        //#region Functions
        function secondUpdate() {
          const second = timeSensor.getSeconds();

          // logger.log('second font');
          normal_time_second_text_font.setProperty(hmUI.prop.TEXT, second.toString().padStart(2, '0'));
        };

        function minuteUpdate() {
          const minute = timeSensor.getMinutes();

          // logger.log('minute font');
          normal_time_minute_text_font.setProperty(hmUI.prop.TEXT, minute.toString().padStart(2, '0'));
          idle_time_minute_text_font.setProperty(hmUI.prop.TEXT, minute.toString().padStart(2, '0'));
        };

        function hourUpdate() {
          const format_hour = timeSensor.getFormatHour(); // 12 or 24

          // logger.log('hour font');
          normal_time_hour_text_font.setProperty(hmUI.prop.TEXT, format_hour.toString().padStart(2, '0'));
          idle_time_hour_text_font.setProperty(hmUI.prop.TEXT, format_hour.toString().padStart(2, '0'));

          amPmUpdate();
        };

        function amPmUpdate() {
          const hourFormat = timeSensor.getHourFormat(); // 12-hour = 0 or 24-hour = 1
          // logger.log('AM PM font');
          if (hourFormat == TIME_HOUR_FORMAT_12) {
            const am_pm = timeSensor.getHours() > 11 ? normal_PM_Text : normal_AM_Text;

            normal_AM_PM_text_font.setProperty(hmUI.prop.TEXT, am_pm);
            idle_AM_PM_text_font.setProperty(hmUI.prop.TEXT, am_pm);
          } else {
            normal_AM_PM_text_font.setProperty(hmUI.prop.TEXT, '');
            idle_AM_PM_text_font.setProperty(hmUI.prop.TEXT, '');
          }
        };

        function dayUpdate() {
          // logger.log('dayUpdate()');
          const day = timeSensor.getDate();

          // logger.log('day font');
          normal_day_text_font.setProperty(hmUI.prop.TEXT, day.toString().padStart(2, '0'));

          weekUpdate();
        };

        function weekUpdate() {
          // logger.log('weekUpdate()');
          const week = timeSensor.getDay();

          // logger.log('day of week font');
          normal_week_text_font.setProperty(hmUI.prop.TEXT, normal_WEEK_Array[week - 1]);
        };

        function updateAllFonts() {
          // logger.log('updateAllFonts()');
          secondUpdate();
          minuteUpdate();
          hourUpdate();
          dayUpdate();
          batteryIconFillUpdate();
        };

        function batteryIconFillUpdate() {
          // logger.log('batteryIconFillUpdate()');
          const valueBattery = battery.getCurrent();
          let progressBattery = valueBattery / 100;
          let originPositionY = 453;
          let height = -21 * progressBattery;

          if (progressBattery > 1) progressBattery = 1;

          if (height < 0) {
            height = -height;
            originPositionY = originPositionY - height; // origin
          }

          normal_battery_linear_scale.setProperty(hmUI.prop.Y, originPositionY);
          normal_battery_linear_scale.setProperty(hmUI.prop.H, height);
        };

        // fonts size configuration
        function useFontLanguageSize() {
          let textSizeConfig = {
            normal_battery_current_text_size: px(40),
            normal_time_hour_text_size: px(150),
            normal_time_minute_text_size: px(150),
            normal_time_second_text_size: px(50),
            normal_AM_PM_text_size: px(42),
            normal_day_text_size: px(40),
            normal_week_text_size: px(40),
            idle_AM_PM_text_size: px(42),
            idle_time_hour_text_size: px(150),
            idle_time_minute_text_size: px(150),
          }

          switch (getLanguage()) {
            case 0: // Chinese
            case 1: // Chinese Traditional
            case 5: // Korean
            case 11: // Japanese
              textSizeConfig.normal_week_text_size = px(24);
              textSizeConfig.normal_AM_PM_text_size = px(26);
              textSizeConfig.idle_AM_PM_text_size = px(26);
              break;
            default: break;
          }

          text_size_config = textSizeConfig;
        };

        // font file configuration
        function useFontLanguage() {
          switch (getLanguage()) {
            case 0: // Chinese
            case 1: // Chinese Traditional
            case 5: // Korean
            case 11: // Japanese
              font_file_text = undefined; // system font
              font_file_number = font('Courier Prime Sans.ttf');
              break;
            default:
              font_file_text = font('Courier Prime Sans.ttf');
              font_file_number = font('Courier Prime Sans.ttf');
              break;
          }

        };

        function settingsLanguageConfig() {
          // logger.log('settingsLanguageConfig()');

          useFontLanguageSize();
          useFontLanguage();

          normal_WEEK_Array = [
            getText('week_mon'),
            getText('week_tue'),
            getText('week_wed'),
            getText('week_thu'),
            getText('week_fri'),
            getText('week_sat'),
            getText('week_sun')
          ];

          normal_AM_Text = getText("AM");
          normal_PM_Text = getText("PM");
        };

        // Create the color picker overlay and buttons on demand.
        function changeWatchFaceStyle() {
          // logger.log('changeWatchFaceStyle()');

          if (colorDialogWidgets.length) {
            // already open -> close it
            closeColorDialog();
            return;
          }

          // semi-transparent overlay
          const colorDialogOverlay = hmUI.createWidget(hmUI.widget.CIRCLE, {
            center_x: px(240),
            center_y: px(240),
            radius: px(240),
            color: 0x000000,
            alpha: 200,
            show_level: hmUI.show_level.ONLY_NORMAL,
          });

          colorDialogWidgets.push(colorDialogOverlay);

          // layout buttons in a simple grid
          const btnSize = 60;
          const padding = 10;
          const columns = 6;
          const startX = 35;
          const startY = 105;

          colorPalette.forEach((color, idx) => {
            const colX = startX + (idx % columns) * (btnSize + padding);
            const colY = startY + Math.floor(idx / columns) * (btnSize + padding);

            // colored background rect (visual)
            const buttonFillColor = hmUI.createWidget(hmUI.widget.FILL_RECT, {
              x: px(colX), y: px(colY), w: px(btnSize), h: px(btnSize),
              color: color,
              radius: px(64),
              show_level: hmUI.show_level.ONLY_NORMAL,
            });

            // invisible button over the rect to receive clicks
            const buttonColor = hmUI.createWidget(hmUI.widget.BUTTON, {
              x: px(colX), y: px(colY), w: px(btnSize), h: px(btnSize),
              normal_src: img('transparent.png'),
              press_src: img('transparent.png'),
              show_level: hmUI.show_level.ONLY_NORMAL,
              click_func: () => {
                applyTextColorNumber(color);
                closeColorDialog();
              }
            });

            colorDialogWidgets.push(buttonFillColor, buttonColor);
          });

          // cancel button
          const cancelBtn = hmUI.createWidget(hmUI.widget.BUTTON, {
            x: px(160), y: px(400), w: px(160), h: px(72),
            normal_src: img('transparent.png'),
            press_src: img('transparent.png'),
            font: font_file_text,
            show_level: hmUI.show_level.ONLY_NORMAL,
            click_func: () => closeColorDialog()
          });

          // optional label could be added; keep simple to minimize resources
          colorDialogWidgets.push(cancelBtn);
        }

        function closeColorDialog() {
          // logger.log('closeColorDialog()');

          if (!colorDialogWidgets.length) return;

          // delete widgets created for the dialog to free memory
          try {
            colorDialogWidgets.forEach(widget => {
              try { hmUI.deleteWidget(widget); } catch (e) { /* ignore individual failures */ }
            });
          } catch (e) {
            logger.log('Error deleting dialog widgets', e);
          }

          // clear references so GC can reclaim memory
          colorDialogWidgets = [];
        }

        function applyTextColorNumber(color) {
          // logger.log('applyTextColorNumber()');
          selectedTextColor = color;

          const widgetsToUpdate = [
            normal_time_minute_text_font,
            idle_time_minute_text_font,
            normal_AM_PM_text_font,
            idle_AM_PM_text_font,
            normal_day_text_font,
            normal_battery_linear_scale,
            normal_battery_icon_img_top,
            normal_battery_icon_img_out,
          ];

          widgetsToUpdate.forEach(widget => {
            widget.setProperty(hmUI.prop.COLOR, color);
          });
        }
        //#endregion Functions

        //#region WIDGET_DELEGATE
        const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
          resume_call: (function () {
            // logger.log('resume_call()');
            updateAllFonts();

            const screenType = getScene();
            if (screenType == SCENE_WATCHFACE || screenType == SCENE_AOD) {
              if (!timerId) {
                if (useTimer) {
                  timerId = timer.createTimer(0, 1000, secondUpdate, {});
                } else if (useInterval) {
                  timerId = setInterval(secondUpdate, 1000);
                }
                else {
                  logger.log('No timer available!');
                }
              }
            }
          }),

          pause_call: (function () {
            // logger.log('pause_call()');

            if (timerId) {
              if (useTimer) timer.stopTimer(timerId);
              if (useInterval) clearInterval(timerId);
              timerId = null;
            }
          }),
        });

        // call once when watchface inited
        updateAllFonts();
      },
      //#endregion WIDGET_DELEGATE

      //#region onInit, build, onDestroy
      onInit() {
        this.settingsLanguageConfig()
        // logger.log('index page.js on init invoke');
        // determine available timer function
        if (typeof timer !== 'undefined' && typeof timer.createTimer == 'function') {
          useTimer = true; // timer.createTimer
        } else if (typeof setInterval == 'function') {
          useInterval = true;   // setInterval
        } else {
          logger.log('No timer available!');
        }

      },
      build() {
        this.init_view();
        logger.log('index page.js on ready invoke');
      },
      onDestroy() {
        // clean up timer
        if (timerId) {
          if (useInterval) clearInterval(timerId);
          else timer.stopTimer(timerId);
          timerId = null;
        }
        logger.log('index page.js on destroy invoke');
      }
      //#endregion onInit, build, onDestroy
    })

  })();
} catch (e) {
  console.log('Watchface Error', e);
  e && e.stack && e.stack.split(/\n/).forEach(i => console.log('error stack', i));
}