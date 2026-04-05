import { AvatarController } from '../../avatar/controller';
import { Avatar } from 'virtual-avatar';

// virtual-avatarモジュールのモック
jest.mock('virtual-avatar', () => {
  return {
    Avatar: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn().mockResolvedValue(undefined),
        say: jest.fn().mockResolvedValue(undefined),
        setExpression: jest.fn()
      };
    })
  };
});

describe('AvatarController', () => {
  let controller;
  let mockContainer;

  beforeEach(() => {
    // DOM要素のモック
    mockContainer = document.createElement('div');
    mockContainer.id = 'dummy-container';
    document.body.appendChild(mockContainer);
    
    // getElementByIdをモックして常にmockContainerを返すようにする
    jest.spyOn(document, 'getElementById').mockReturnValue(mockContainer);

    // Avatarクラスのモックをクリア
    Avatar.mockClear();

    controller = new AvatarController('dummy-container');
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
    jest.restoreAllMocks();
  });

  test('initメソッドがアバターを初期化すること', async () => {
    const vrmUrl = '/path/to/model.vrm';
    await controller.init(vrmUrl);

    expect(Avatar).toHaveBeenCalledTimes(1);
    expect(controller.avatar).toBeDefined();
    expect(controller.avatar.init).toHaveBeenCalledWith(mockContainer, vrmUrl);
  });

  test('applyEmotionが正しくSDKの感情にマッピングされること', async () => {
    await controller.init('/path/to/model.vrm');

    // smile -> happy
    controller.applyEmotion('smile');
    expect(controller.avatar.setExpression).toHaveBeenCalledWith('happy');

    // thinking -> relaxed
    controller.applyEmotion('thinking');
    expect(controller.avatar.setExpression).toHaveBeenCalledWith('relaxed');

    // マッピングにないもの -> neutral
    controller.applyEmotion('unknown');
    expect(controller.avatar.setExpression).toHaveBeenCalledWith('neutral');
  });

  test('speakメソッドが感情反映と発話を順に実行すること', async () => {
    await controller.init('/path/to/model.vrm');
    
    // applyEmotion が呼ばれたか確認するためスパイ化
    const applyEmotionSpy = jest.spyOn(controller, 'applyEmotion');

    await controller.speak('こんにちは', 'smile');

    expect(applyEmotionSpy).toHaveBeenCalledWith('smile');
    expect(controller.avatar.setExpression).toHaveBeenCalledWith('happy'); // applyEmotion内部の動作確認
    expect(controller.avatar.say).toHaveBeenCalledWith('こんにちは');
  });
});
