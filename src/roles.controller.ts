import {Controller, UseFilters} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddUserRoleDto } from "./dto/addUserRole.dto";
import {HttpExceptionFilter} from "./http-exception.filter";

@Controller()
@UseFilters(new HttpExceptionFilter())
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @MessagePattern({ cmd: 'createRole' })
  async createRole(@Payload() data: { dto: RoleDto }) {
    return await this.rolesService.createRole(data.dto);
  }
  @MessagePattern({ cmd: 'getRoleById' })
  async getRoleById(@Payload() data: { id: number }) {
    return await this.rolesService.getRoleById(data.id);
  }
  @MessagePattern({ cmd: 'getAllRoles' })
  async getAllRoles() {
    return await this.rolesService.getAllRoles();
  }
  @MessagePattern({ cmd: 'updateRole' })
  async updateRole(@Payload() data: { id: number; dto: RoleDto }) {
    return await this.rolesService.updateRole(data.id, data.dto);
  }
  @MessagePattern({ cmd: 'deleteRoleByValue' })
  async deleteRoleByValue(@Payload() data: { value: string }) {
    return await this.rolesService.deleteRoleByValue(data.value);
  }
  @MessagePattern({ cmd: 'addUserRoles' })
  async addUserRoles(@Payload() data: { dto: AddUserRoleDto }) {
    return await this.rolesService.addUserRoles(data.dto);
  }
  @MessagePattern({ cmd: 'getUserRoles' })
  async getUserRoles(@Payload() data: { userId: number }) {
    return await this.rolesService.getUserRoles(data.userId);
  }
  @MessagePattern({ cmd: 'deleteUserRoles' })
  async deleteUserRoles(@Payload() data: { dto: AddUserRoleDto }) {
    return await this.rolesService.deleteUserRoles(data.dto);
  }
}
