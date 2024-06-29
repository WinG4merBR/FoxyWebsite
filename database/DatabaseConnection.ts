import mongoose from 'mongoose';
import { User } from 'discordeno/transformers';
import { Schemas } from './schemas/Schemas';
import { logger } from '../structures/logger';
import { createRestManager } from 'discordeno/rest';
import { createBotConstants } from 'discordeno/*';
import { rest } from '../client/app';
export default class DatabaseConnection {
    public key: any;
    public user: any;
    public commands: any;
    public guilds: any;
    public riotAccount: any;
    public backgrounds: any;
    public layouts: any;
    public decorations: any;

    constructor() {
        mongoose.set("strictQuery", true)
        mongoose.connect(String(process.env.MONGO_URI)).catch((error) => {
            logger.error(`[DATABASE] Failed to connect to database: `, error);
        });
        logger.info(`[DATABASE] Connected to database!`);

        this.user = mongoose.model('user', Schemas.userSchema);
        this.commands = mongoose.model('commands', Schemas.commandsSchema);
        this.guilds = mongoose.model('guilds', Schemas.guildSchema);
        this.key = mongoose.model('key', Schemas.keySchema);
        this.backgrounds = mongoose.model('backgrounds', Schemas.backgroundSchema);
        this.layouts = mongoose.model('layouts', Schemas.layoutSchema);
        this.decorations = mongoose.model('decorations', Schemas.avatarDecorationSchema);
        this.riotAccount = mongoose.model('riotAccount', Schemas.riotAccountSchema);
    }

    async getUser(userId: string): Promise<any> {
        if (!userId) null;
        const user: User = await rest.getUser(userId);
        let document = await this.user.findOne({ _id: user.id });

        if (!document) {
            document = new this.user({
                _id: user.id,
                userCreationTimestamp: new Date(),
                isBanned: false,
                banDate: null,
                banReason: null,
                userCakes: {
                    balance: 0,
                    lastDaily: null,
                },
                marryStatus: {
                    marriedWith: null,
                    marriedDate: null,
                    cantMarry: false,
                },
                userProfile: {
                    decoration: null,
                    decorationList: [],
                    background: "default",
                    backgroundList: ["default"],
                    repCount: 0,
                    lastRep: null,
                    layout: "default",
                    aboutme: null,
                },
                userPremium: {
                    premium: false,
                    premiumDate: null,
                    premiumType: null,
                },
                userSettings: {
                    language: 'pt-br'
                },
                petInfo: {
                    name: null,
                    type: null,
                    rarity: null,
                    level: 0,
                    hungry: 100,
                    happy: 100,
                    health: 100,
                    lastHungry: null,
                    lastHappy: null,
                    isDead: false,
                    isClean: true,
                    food: []
                },
                userTransactions: [],
                riotAccount: {
                    isLinked: false,
                    puuid: null,
                    isPrivate: false,
                    region: null
                },
                premiumKeys: [],
                roulette: {
                    availableSpins: 5,
                }
            }).save();
        }

        return document;
    }

    async registerCommand(commandName: string, commandDescription: string): Promise<void> {
        let commandFromDB = await this.commands.findOne({ commandName: commandName });

        if (!commandFromDB) {
            commandFromDB = new this.commands({
                commandName: commandName,
                commandUsageCount: 0,
                description: commandDescription,
                isInactive: false,
                subcommands: null,
                usage: null
            }).save();
        } else {
            commandFromDB.description = commandDescription
            await commandFromDB.save();

            return;
        }
    }

    async getAllCommands(): Promise<any> {
        let commandsData = await this.commands.find({});
        return commandsData.map(command => command.toJSON());
    }

    async getCode(code: string): Promise<any> {
        const riotAccount = this.riotAccount.findOne({ authCode: code });
        if (!riotAccount) return null;
        return riotAccount;
    }

    async getAllUsageCount(): Promise<Number> {
        let commandsData = await this.commands.find({});
        let usageCount = 0;
        commandsData.map(command => usageCount += command.commandUsageCount);
        return usageCount;

    }

    async getGuild(guildId: String): Promise<any> {
        let document = await this.guilds.findOne({ _id: guildId });
        return document;
    }

    async addGuild(guildId: String): Promise<any> {
        let document = await this.guilds.findOne({ _id: guildId });

        if (!document) {
            document = new this.guilds({
                _id: guildId,
                GuildJoinLeaveModule: {
                    isEnabled: false,
                    joinMessage: null,
                    alertWhenUserLeaves: false,
                    leaveMessage: null,
                    joinChannel: null,
                    leaveChannel: null,
                },
                valAutoRoleModule: {
                    isEnabled: false,
                    unratedRole: null,
                    ironRole: null,
                    bronzeRole: null,
                    silverRole: null,
                    goldRole: null,
                    platinumRole: null,
                    diamondRole: null,
                    ascendantRole: null,
                    immortalRole: null,
                    radiantRole: null,
                },
                premiumKeys: []

            }).save()
        }

        return document;
    }

    async removeGuild(guildId: BigInt): Promise<any> {
        let document = await this.guilds.findOne({ _id: guildId });

        if (document) {
            document.delete();
        } else {
            return null;
        }

        return document;
    }

    async getAllUsers(): Promise<void> {
        let usersData = await this.user.find({});
        return usersData.map(user => user.toJSON());
    }

    async getAllGuilds(): Promise<void> {
        let guildsData = await this.guilds.find({});
        return guildsData.length;
    }

    async getAllBackgrounds(): Promise<Background[]> {
        let backgroundsData = await this.backgrounds.find({});
        return backgroundsData.map(background => background.toJSON());
    }

    async getBackground(backgroundId: string): Promise<Background> {
        let backgroundData = await this.backgrounds.findOne({ id: backgroundId });
        return backgroundData;
    }

    async getAllLayouts(): Promise<Layout[]> {
        let layoutsData = await this.layouts.find({});
        return layoutsData.map(layout => layout.toJSON());
    }

    async getLayout(layoutId: string): Promise<Layout> {
        let layoutData = await this.layouts.findOne({ id: layoutId });
        return layoutData;
    }

    async getAllDecorations(): Promise<AvatarDecoration[]> {
        let decorationsData = await this.decorations.find({});
        return decorationsData.map(decoration => decoration.toJSON());
    }

    async getDecoration(decorationId: string): Promise<AvatarDecoration> {
        let decorationData = await this.decorations.findOne({ id: decorationId });
        return decorationData;
    }
}

export interface Background {
    id: string,
    name: string,
    cakes: number,
    filename: string,
    description: string,
    author: string,
    inactive: boolean,
}

export interface Layout {
    id: string,
    name: string,
    filename: string,
    description: string,
    cakes: number,
    inactive: boolean,
    author: string,
    darkText: boolean,
}

export interface AvatarDecoration {
    id: string,
    name: string,
    cakes: number,
    filename: string,
    description: string,
    inactive: boolean,
    author: string,
    isMask: boolean,
}