import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsObject()
    @IsOptional()
    permissions?: Record<string, boolean>;
}
