import { App, DropdownComponent, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!
import  QuestionsModal  from './component/myModal';
import QuizSettings from './settings';
import { quizSettings,DEFAULT_SETTINGS } from 'types';


export default class quizPlugin extends Plugin {
	settings: quizSettings;

	async onload() {
		await this.loadSettings();
		
		this.addRibbonIcon('book-open-check', 'Greet', () => {
			new QuestionsModal(this.app,this).open();
		  });
		
		this.addCommand({
			id: 'start-quiz',
			name: 'Start simple quiz',
			callback: () => {
				new QuestionsModal(this.app,this).open();
			}
		});
		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QuizSettings(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}
