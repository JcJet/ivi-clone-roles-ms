import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { Repository } from 'typeorm';
import { UserRoles } from './roles_users.entity';
import { AddUserRoleRecordDto } from './dto/addUserRoleRecord.dto';
import { AddUserRoleDto } from './dto/addUserRole.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { logCall } from './decorators/logging-decorator';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRoles)
    private userRolesRepository: Repository<UserRoles>,
    @Inject('TO_AUTH_MS') private toAuthProxy: ClientProxy,
  ) {}

  @logCall()
  async getRepository(): Promise<Repository<Role>> {
    return this.rolesRepository;
  }
  @logCall()
  async checkUserExists(userId) {
    const user = await lastValueFrom(
      this.toAuthProxy.send({ cmd: 'getUser' }, { userId }),
    );
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
  }
  async onModuleInit() {
    const initialRoles: RoleDto[] = [
      { value: 'ADMIN', description: 'Admin user' },
      { value: 'USER', description: 'User' },
    ];
    for (const roleDto of initialRoles) {
      try {
        await this.createRole(roleDto);
      } catch (e) {
        if (e.status != HttpStatus.CONFLICT) {
          throw e;
        }
      }
    }
  }
  @logCall()
  async createRole(dto: RoleDto): Promise<Role> {
    const existingRole: Role = await this.rolesRepository.findOneBy({
      value: dto.value,
    });

    if (existingRole) {
      throw new HttpException(
        'Роль с таким названием уже существует',
        HttpStatus.CONFLICT,
      );
    }
    const rolesInsertResult = await this.rolesRepository.insert(dto);
    return rolesInsertResult.raw[0];
  }
  @logCall()
  async getRoleById(id: number): Promise<Role> {
    const role: Role = await this.rolesRepository.findOneBy({ id });
    if (!role) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
    return role;
  }
  @logCall()
  async getRoleByValue(value: string): Promise<Role> {
    const role: Role = await this.rolesRepository.findOneBy({ value });
    if (!role) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
    return role;
  }
  @logCall()
  async getAllRoles(): Promise<Role[]> {
    return await this.rolesRepository.find();
  }
  @logCall()
  async updateRole(id: number, dto: RoleDto) {
    const existingRole: Role = await this.rolesRepository.findOneBy({
      value: dto.value,
    });

    if (existingRole) {
      throw new HttpException(
        'Роль с таким названием уже существует',
        HttpStatus.CONFLICT,
      );
    }

    try {
      return await this.rolesRepository.update({ id }, dto);
    } catch (e) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
  }
  @logCall()
  async deleteRoleByValue(
    value: string,
  ): Promise<{ deletedRoles: number; affectedUsers: number }> {
    let roleId: number;
    try {
      const role: Role = await this.rolesRepository.findOneBy({ value });
      roleId = role.id;
      await this.rolesRepository.delete({ value });
    } catch (e) {
      throw new HttpException('Роль не найдена', HttpStatus.NOT_FOUND);
    }
    if (roleId) {
      const deletedRoles = 1;
      const deletionResult = await this.userRolesRepository.delete({ roleId });
      const affectedUsers = deletionResult.affected;
      return { deletedRoles, affectedUsers };
    }
    return { deletedRoles: 0, affectedUsers: 0 };
  }
  @logCall()
  async addUserRoles(dto: AddUserRoleDto): Promise<{ addedRoles: number }> {
    await this.checkUserExists(dto.userId);
    let addedRoles = 0;
    for (const roleValue of dto.roles) {
      const existingRole: Role = await this.rolesRepository.findOneBy({
        value: roleValue,
      });
      if (!existingRole) {
        await this.createRole({ value: roleValue, description: '' });
      }
      const role: Role = await this.getRoleByValue(roleValue);
      const addRoleDto: AddUserRoleRecordDto = {
        roleId: role.id,
        userId: dto.userId,
      };
      const existingUserRole = await this.userRolesRepository.findOneBy(
        addRoleDto,
      );
      if (!existingUserRole) {
        await this.userRolesRepository.insert(addRoleDto);
        addedRoles += 1;
      }
    }
    return { addedRoles };
  }
  @logCall()
  async getUserRoles(userId: number): Promise<Role[]> {
    await this.checkUserExists(userId);
    const userRoles: Role[] = [];
    const rolesUsers: UserRoles[] = await this.userRolesRepository.find({
      where: { userId },
    });
    for (const roleRecord of rolesUsers) {
      const role: Role = await this.getRoleById(roleRecord.roleId);
      userRoles.push(role);
    }
    return userRoles;
  }
  @logCall()
  async deleteUserRoles(
    dto: AddUserRoleDto,
  ): Promise<{ deletedRoles: number }> {
    await this.checkUserExists(dto.userId);
    let deletedRoles = 0;
    for (const roleValue of dto.roles) {
      const role: Role = await this.getRoleByValue(roleValue);
      const deletionResult = await this.userRolesRepository.delete({
        roleId: role.id,
      });
      const affectedRows = deletionResult.affected || 0;
      deletedRoles += affectedRows;
    }
    return { deletedRoles };
  }
}
