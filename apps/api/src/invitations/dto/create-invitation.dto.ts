import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateInvitationDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    roleId: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    channelIds?: string[];
}
