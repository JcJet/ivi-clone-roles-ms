import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeORMTestingModule } from './test-utils/TypeORMTestingModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Role } from './roles.entity';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { UserRoles } from './roles_users.entity';
import { RoleDto } from './dto/role.dto';
import { AddUserRoleDto } from './dto/addUserRole.dto';

describe('roles Controller', () => {
  let controller: RolesController;
  let service: RolesService;
  let repository: Repository<Role>;

  beforeAll(async () => {
    const rolesModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),

        TypeORMTestingModule([Role, UserRoles]),
        TypeOrmModule.forFeature([Role, UserRoles]),
        ClientsModule.registerAsync([
          {
            name: 'TO_AUTH_MS',
            useFactory: (configService: ConfigService) => ({
              transport: Transport.RMQ,
              options: {
                urls: [configService.get<string>('RMQ_URL')],
                queue: 'toAuthMs',
                queueOptions: {
                  durable: false,
                },
              },
            }),
            inject: [ConfigService],
            imports: [ConfigModule],
          },
        ]),
      ],
      providers: [RolesService],
      controllers: [RolesController],
    }).compile();

    controller = rolesModule.get<RolesController>(RolesController);
    service = rolesModule.get<RolesService>(RolesService);
    repository = await service.getRepository();

    const app = rolesModule.createNestApplication();
    const connection = repository.manager.connection;
    await connection.synchronize(true);
    await app.init();

    jest.spyOn(service, 'checkUserExists').mockImplementation(async () => {});
  });
  describe('roles CRUD', () => {
    it('create new role with correct properties', async () => {
      const createRoleDto: RoleDto = {
        value: 'test role',
        description: 'role for tests',
      };

      const createdRole: Role = await controller.createRole({
        dto: createRoleDto,
      });
      const roleId = createdRole.id;
      const roleFromDb = await repository.findOneBy({ id: roleId });
      expect(roleFromDb.value).toEqual(createRoleDto.value);
      expect(roleFromDb.description).toEqual(createRoleDto.description);
    });
    it('update role', async () => {
      const createRoleDto: RoleDto = {
        value: 'test role 2',
        description: 'role for tests 2',
      };
      const createdRole: Role = await controller.createRole({
        dto: createRoleDto,
      });
      const roleId = createdRole.id;

      const updateRoleDto: RoleDto = {
        value: 'updated role',
        description: 'updated description',
      };
      await controller.updateRole({ id: roleId, dto: updateRoleDto });
      const roleFromDb = await repository.findOneBy({ id: roleId });
      expect(roleFromDb.value).toEqual(updateRoleDto.value);
      expect(roleFromDb.description).toEqual(updateRoleDto.description);
    });
    it('delete role by value', async () => {
      const createRoleDto: RoleDto = {
        value: 'test role 3',
        description: 'role for tests',
      };

      const createdRole: Role = await controller.createRole({
        dto: createRoleDto,
      });
      const roleId = createdRole.id;
      await controller.deleteRoleByValue({ value: createRoleDto.value });
      const roleFromDb = await repository.findOneBy({ id: roleId });
      expect(roleFromDb).toBeNull();
    });
    it('get role by id', async () => {
      const createRoleDto: RoleDto = {
        value: 'test role 4',
        description: 'role for tests',
      };

      const createdRole: Role = await controller.createRole({
        dto: createRoleDto,
      });
      const roleId = createdRole.id;
      const roleFromDb = await controller.getRoleById({ id: roleId });

      expect(roleFromDb.value).toEqual(createRoleDto.value);
      expect(roleFromDb.description).toEqual(createRoleDto.description);
    });
    it('add/get user roles', async () => {
      const addRolesDto: AddUserRoleDto = {
        userId: 1,
        roles: ['test1', 'test2', 'test3'],
      };

      await controller.addUserRoles({ dto: addRolesDto });
      const userRoles = await controller.getUserRoles({
        userId: addRolesDto.userId,
      });

      expect(userRoles[0].value).toEqual(addRolesDto.roles[0]);
      expect(userRoles[1].value).toEqual(addRolesDto.roles[1]);
      expect(userRoles[2].value).toEqual(addRolesDto.roles[2]);
    });
    it('remove user roles', async () => {
      const addRolesDto: AddUserRoleDto = {
        userId: 2,
        roles: ['test4', 'test5', 'test6'],
      };

      await controller.addUserRoles({ dto: addRolesDto });
      const userRolesBefore = await controller.getUserRoles({
        userId: addRolesDto.userId,
      });
      expect(userRolesBefore[0].value).toEqual(addRolesDto.roles[0]);
      expect(userRolesBefore[1].value).toEqual(addRolesDto.roles[1]);
      expect(userRolesBefore[2].value).toEqual(addRolesDto.roles[2]);

      const deleteRolesDto: AddUserRoleDto = {
        userId: addRolesDto.userId,
        roles: addRolesDto.roles.slice(0, 2),
      };
      await controller.deleteUserRoles({ dto: deleteRolesDto });
      const userRolesAfter = await controller.getUserRoles({
        userId: addRolesDto.userId,
      });
      expect(userRolesAfter[0].value).toEqual(addRolesDto.roles[2]);
    });
  });
});
